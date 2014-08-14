/**
 * Web crawling utilities for gaijin pot
 */

var _ = require('underscore'),
    Edifice = require('../../models/edifice'),
    text = require('../../data_util/text_utils'),
    stationQueries = require('../../search/station'),
    formatStationName = require('../../data_util/text_utils').formatStationName,
    Crawler = require('./crawler.js'),
    GaijinPotScraper = require("../scraping/scrapers").GaijinPotScraper;

var stationUrl = "http://apartments.gaijinpot.com/en/rent/listing?station=";

//Crawl for apartments from a starting station for a maxDistance
var CrawlGaijinPot = function(station, maxDistance) {
  var errorHandler = function (error) {
        console.error(error);
      },
      onData = function (edificeData) {
        //Find matching stations
        stationQueries.stationsForNames(edificeData.stations.map(formatStationName))
        .then(
          function (stations) {
            if (stations.length < edificeData.stations.length) {
              console.error("Station mismatch!");
            }
            //Build edifice
            edificeData.stations = stations;
            edificeData.valid = true;
            Edifice.create(edificeData).add();
          },
          errorHandler
        );
      };

  stationQueries.stationsNear(station, maxDistance).then(
    function (stations) {
      var iterator = function () {
        var starters = _.chain(stations)
                       .pluck('ekidataId')
                       .map(function (id) { return stationUrl + id; })
                       .value();
        return {
          hasNext: function () { return !_.isEmpty(starters); },
          next: function () { return starters.shift(); }
        };
      }
      var options = {
          iterator: iterator(),
          domain: "http://apartments.gaijinpot.com",
          onData: onData,
          onError: errorHandler,
          Scraper: GaijinPotScraper,
          paths: {
            candidatesPath: 'div.property_right > div > div.desc_bottom > a',
            nextPath: '.pagination_next'
          }
      };
      //Start scraper
      Crawler(options);
    },
    errorHandler);

}

CrawlGaijinPot("Roppongi", 14);
