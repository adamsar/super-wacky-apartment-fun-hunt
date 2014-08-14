/**
 * Web crawler for GaijinPot listings
 */

var Station = require("../../models/station"),
    _ = require('underscore'),
    q = require('q'),
    request = require('request'),
    Maybe = require('../../functional/maybe').Maybe,
    Empty = require('../../functional/maybe').Empty,
    cheerio = require('cheerio');

var EligibleApartments = function(starterName, maxDistance) {
  var deferred = q.defer();
  Station.search(1, { $or: [
    { "name.romanji": starterName },
    { "name.kana": starterName },
    { "name.kanji": starterName }
  ] }, function (station) {
         station = _.first(station)
         var query = {
             location: {
               $nearSphere: [station.lon, station.lat],
               $maxDistance: (maxDistance / 6378)
             }
         };
         Station.search(2000, query, function (stations) {
           deferred.resolve(stations);
         });
       });
  return deferred.promise;
}

var Crawler = function (options) {
  var iterator = options.iterator,
      paths = _.extend({
        candidatesPath: '',
        nextPath: ''
      }, options.paths),
      domain = options.domain,
      onData = options.onData,
      onError = options.onError,
      Scraper = options.Scraper,
      processed = [],
      itemQueue = [];
  /**
   * Get the next link in the queue
   */
  var getNext = function () {
    if (itemQueue.length === 0) {
      if (iterator.hasNext()) {
        return Maybe(iterator.next());
      } else {
        return Empty;
      }
    } else {
      return Maybe(itemQueue.shift());
    }
  }

  /**
   * Processes the next link
   */
  var doNext = function () {
    var next = getNext();
    if (next === Empty) {
      console.info("Done");
      return
    }

    next.filter(function(url) {
      return !_.contains(processed, url) })
    .mapOr(doRequest, doNext);
  }

  /**
   * Make a request to a page that will yield the next link and
   * canddiates to scrape
   */
  var doRequest = function (url) {
    console.info(url);
    processed.push(url);
    request(url, function (error, response, body) {
      if (error) {
        onError(error);
        doNext();
      } else if (response.statusCode !== 200) {
        onError(response.statusCode);
        doNext();
      } else {
        //Get candidates, push next(s) on the queue
        var $ = cheerio.load(body),
            nexts = $(paths.nextPath),
            candidates = $(paths.candidatesPath);

        //Extract all next links, push them to the queue
        _.each(nexts, function (el) {
          var val = domain + $(el).attr('href');
          if (val) {
            itemQueue.push(val);
          }
        });

        //Extract all candidate listings and asynchronously scrape them
        _.each(candidates, function (candidate) {
          var val = domain + $(candidate).attr('href');
          if (val) {
            try {
              setTimeout(function () {
                Scraper.scrape(val).then(onData, onError)
              }, 0);
            } catch (error) { onError(error) }
          }
        });
        //Do the next link the queue
        doNext();
      }
    });
  }
  //Start the scrape
  doNext();
}

module.exports = Crawler;