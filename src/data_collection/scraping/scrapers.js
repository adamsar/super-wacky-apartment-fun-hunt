/**
 * Collection of specific page scrapers
 */
var request = require('request'),
    cheerio = require('cheerio'),
    q = require('q'),
    _ = require('underscore'),
    extractors = require('../../data_util/text_extraction');

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
      self.$ = cheerio.load(body, {
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
      return;
    }

    //address

    //rent
    rent = this.$(".price").text();
    if (_.isEmpty(rent)) {
      this.deferred.reject("Could not find rent");
      return;
    } else {
      rent = extractors.moneyMentions(rent);
      if (rent.length != 1) {
        this.deferred.reject("Could not parse rent");
        return;
      } else {
        rent = rent[0]
      }
    }

    //Key money
    keyMoney = this.$('#details_info > div:nth-child(2) > div.desc_section.right > span.value').text()
    if (_.isEmpty(keyMoney)) {
      this.deferred.reject("Could not parse key money");
    } else {
      keyMoney = new extractors.AmbiguousExtractor(keyMoney).applyTo(rent);
      if (keyMoney === null) {
        this.deferred.reject("Couldn't parse key money");
        return;
      }
    }
    //Deposit
    deposit = this.$("#details_info > div:nth-child(2) > div:nth-child(1) > span.value").text()
    if (_.isEmpty(deposit)) {
      this.deferred.reject("Could not parse key money");
    } else {
      deposit = new extractors.AmbiguousExtractor(deposit).applyTo(rent);
      if (deposit === null) {
        this.deferred.reject("Couldn't parse key money");
        return;
      }
    }

    //size
    //layout

    this.deferred.resolve({
      rent: rent,
      title: title,
      keyMoney: keyMoney,
      deposit: deposit
    });
  }

});

new GaijinPotScraper("http://apartments.gaijinpot.com/en/rent/view/256078").promise
.then(
  function (data) {
    console.info(data);
  },
  function (error) {
    console.error(error);
  });