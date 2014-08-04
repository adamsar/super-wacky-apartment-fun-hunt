/**
 * Collection of specific page scrapers
 */
var request = require('request'),
    cheerio = require('cheerio'),
    q = require('q'),
    _ = require('underscore'),
    extractors = require('../../data_util/text_extraction'),
    maybe = require('../../functional/maybe'),
    fns = require('../../functional/fns');

/**
 * Add in type to an Error object for use in error handling (switch).
 */
var makeScrapeError = function (error, type) {
  error.prototype.type = type;
}

/**
 * Error denotes that there was an error connecting to
 * the given URL in order to begin the scrape.
 */
var ConnectionError = function (statusCode, url) {
  this.statusCode = statusCode;
  this.url = url;
}

/**
 * Error denotes there was a require field, but it was unable
 * to be found in the scraping data.
 */
var InsufficientInfoError = function (requiredField, url) {
  this.requiredField = requiredField;
  this.url = url;
}

var IncorrectDomainError = function (domain) {
  this.domain = domain;
}

makeScrapeError(ConnectionError, "connectionError");
makeScrapeError(InsufficientInfoError, "insufficientInfo");
makeScrapeError(IncorrectDomainError, "incorrectDomain");

//Default scraping paths
var defaultPaths = {
  titlePath: null,
  addressPath: null,
  rentPath: null,
  keyMoneyPath: null,
  depositPath: null,
  sizePath: null,
  layoutPath: null,
  yearBuiltPath: null,
  maintenanceFeePath: null,
  stationsPath: null
};

var buildScraper = function (domain, defaults) {
  var paths = _.extend(defaultPaths, defaults);

  var PageScrape = function (url, data, deferred) {
    var $ = cheerio.load(data, {}),
        finished = false;
    deferred.promise.then(
      function () { finished = true; },
      function () { finished = true; }
    );

    var searchFor =  function (path) {
      var data = null;
      if (!finished) {
        data = $(path).text();
        if (data === []) {
          data = null;
        }
        return maybe.Maybe(data);
      }
      return maybe.Empty
    };

    var extracts = {
      extractTitle:  function () { return searchFor(paths.titlePath); },
      extractRent: function () { return searchFor(paths.rentPath) },
      extractKeyMoney: function () { return searchFor(paths.keyMoneyPath) },
      extractDeposit: function () { return searchFor(paths.depositPath) },
      extractSize: function () { return searchFor(paths.sizePath) },
      extractLayout: function () { return searchFor(paths.layoutPath) },
      extractDescription: function () { return searchFor(paths.descriptionPath) },
      extractMaintenanceFee: function () { return searchFor(paths.maintenanceFeePath) },
      extractYearBuilt: function () { return searchFor(paths.yearBuiltPath) },
      extractStations: function () {
        var stations = $(paths.stationPath);
        return _.map(stations, function (station) {
                 return station.text();
               });
      }
    };

    var reject = function (error) {
      if (!finished) {
        deferred.reject(error);
      }
    };

    var resolve = function (data) {
      if (!finished) {
        deferred.resolve(data);
      }
    }

    return {
      doScrape: function() {
        var self = this,
            data = {};
        var set = function (key) {
          return function (value) { data[key] = value; }
        };
        var required = function(key) {
          return function () { reject(new InsufficientInfoError(key, url)) };
        };

        extracts.extractTitle().mapOr(set('title'), required('title'));

        extracts.extractRent()
        .map(extractors.moneyMentions)
        .filter(_.isArray)
        .filter(fns.not(_.isEmpty))
        .map(_.first)
        .mapOr(set('rent'), required('rent'));

        extracts.extractKeyMoney()
        .map(function (v) { return new extractors.AmbiguousExtractor(v).applyTo(data.rent); })
        .mapOr(set('keyMoney'), required('keyMoney'));

        extracts.extractDeposit()
        .map(function (v) { return new extractors.AmbiguousExtractor(v).applyTo(data.rent); })
        .mapOr(set('deposit'), required('deposit'));

        extracts.extractSize()
        .map(extractors.size)
        .map(_.first)
        .mapOr(set('size'), required('deposit'));

        extracts.extractLayout()
        .map(function (v) { return v.trim(); })
        .mapOr(set('layout'), required('layout'));

        extracts.extractDescription().map(set('description'));
        extracts.extractStations().map(set('stations'));

        extracts.extractMaintenanceFee()
        .map(extractors.moneyRate)
        .filter(_.isNumber)
        .mapOr(set('maintenance'), required('maintenanceFee'));

        extracts.extractYearBuilt()
        .map(parseInt)
        .mapOr(set('yearBuilt'), required('yearBuilt'));

        resolve(data);
      }
    };
  };


  return {
    scrape: function (url) {
      var self = this;
      if (url.indexOf(domain) === -1) {
        throw new IncorrectDomainError(domain);
      }

      var deferred = q.defer();

      //And do request
      request(url, function (error, response, body) {
        var errorResponse = null;
        if (error) {
          errorResponse = new ConnectionError(error, url);
          console.error(errorResponse);
          deferred.reject(errorResponse);
        } else if (response.statusCode !== 200) {
          errorResponse = new ConnectionError(response.statusCode, url);
          console.error(errorResponse);
          deferred.reject(errorResponse);
        } else {
          PageScrape(url, body, deferred).doScrape();
        }
      });
      return deferred.promise;
    }
  };
}

var GaijinPotScraper = buildScraper("apartments.gaijinpot.com/", {
  titlePath: ".property_name",
  //  addressPath: ".price",
  rentPath: ".price",
  keyMoneyPath: "#details_info > div:nth-child(2) > div.desc_section.right > span.value",
  depositPath: "#details_info > div:nth-child(2) > div:nth-child(1) > span.value",
  sizePath: "#details_info > div:nth-child(4) > div:nth-child(1) > span.value",
  layoutPath: "#property_content_left > section:nth-child(2) > dl > div:nth-child(2) > dd",
  descriptionPath: "#property_content_left > section:nth-child(4) > p",
  maintenanceFeePath: "#property_content_left > section:nth-child(2) > dl > div:nth-child(4) > dd",
  yearBuiltPath: "#property_content_left > section:nth-child(2) > dl > div:nth-child(1) > dd",
  stationsPath: "#property_content_left > section > a"
});

GaijinPotScraper.scrape("http://apartments.gaijinpot.com/en/rent/view/14396").then(
  function (data) {
    console.info(data);
  },
  function (error) {
    console.info(error);
  }
)