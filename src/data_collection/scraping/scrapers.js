/**
 * Collection of specific page scrapers
 */
var request = require('request'),
    cheerio = require('cheerio'),
    q = require('q'),
    _ = require('underscore'),
    extractors = '../../data_util/text_extraction';

var GaijinPotScraper = function (url) {
  var self = this;
  this.deferred = q.defer();
  this.promise = this.deferred.promise;
  this.$ = null;

  request(url, function (error, response, body) {
    if (error) {
      console.error(error);
      q.reject(error);
    } else if (response.statusCode !== 200) {
      console.error(response);
      q.reject(response);
    } else {
      self.$ = cheerio(body, {
        normalizeWhiteSpace: true
      });
      self.doScrape();
    }
  });
}

GaijinPotScraper.prototype = _.extend(GaijinPotScraper.prototype, {

  doScrape: function () {
    var scraped = {},
        title = null,
        address = null,
        rent = null,
        keyMoney = null,
        deposit = null;

    //title
    title = this.$(".property_name").text();
    if (_.isEmpty(title)) {
      this.deferred.reject("Could not parse name");
    }

    //address

    //rent
    rent = this.$("price").text();
    if (_.isEmpty(rent)) {
      this.deferred.reject("Could not parse rent");
    } else {
      rent = extractors.moneyMentions(rent);
      if (rent.length != 1) {
        this.deferred.reject("Could not parse rent");
      } else {
        rent = rent[0]
      }
    }

    //Key month
    //Deposit

  }

});