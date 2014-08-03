/**
 * Collection of specific page scrapers
 */
var request = require('request'),
    cheerio = require('cheerio'),
    q = require('q'),
    _ = require('underscore'),
    extractors = require('../../data_util/text_extraction');

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

makeScrapeError(ConnectionError, "connectionError");
makeScrapeError(InsufficientInfoError, "insufficientInfo");

var GaijinPotScraper = function (url) {

}

var Scraper = function (url) {
  var self = this;
  this.deferred = q.defer();
  this.promise = this.deferred.promise;
  this.url = url;
  this.$ = null;

  request(url, function (error, response, body) {
    var errorResponse = null;
    if (error) {
      errorResponse = new ConnectionError(error, url);
      console.error(errorResponse);
      q.reject(errorResponse);
    } else if (response.statusCode !== 200) {
      errorResponse = new ConnectionError(response.statusCode, url);
      console.error(errorResponse);
      q.reject(errorResponse);
    } else {
      self.$ = cheerio.load(body, {
        normalizeWhiteSpace: true
      });
      self.doScrape();
    }
  });
}

var buildScraper = function () {
  
}

GaijinPotScraper.prototype = _.extend(GaijinPotScraper.prototype, {

  doScrape: function () {
    var self = this,
        scraped = {},
        title = null,
        address = null,
        rent = null,
        keyMoney = null,
        deposit = null,
        size = null,
        layout = null,
        description = null,
        yearBuilt = null,
        maintenanceFee = null,
        stations = null;

    //title
    title = this.$(".property_name").text();
    if (_.isEmpty(title)) {
      this.deferred.reject("Could not parse name");
      return;
    }

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
      var copy = _.clone(keyMoney);
      console.info(copy);
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
    size = this.$("#details_info > div:nth-child(4) > div:nth-child(1) > span.value").text();
    if (size) {
      size = extractors.size(size)[0];
    }
    if (!size) {
      this.deferred.reject("Couldn't process size");
      return;
    }

    //layout
    layout = this.$("#property_content_left > section:nth-child(2) > dl > div:nth-child(2) > dd").text();
    if (layout) {
      layout = layout.trim();
    }
    if (!layout) {
      this.deferred.reject("Unable to find layout");
      return;
    }

    //description - optional
    description = this.$("#property_content_left > section:nth-child(4) > p").text()

    //stations
    stations = [];
    this.$("#property_content_left > section > a").each( function (index, elem) {
      stations.push(self.$(elem).text());
    });

    //Maintenance fee
    maintenanceFee = this.$("#property_content_left > section:nth-child(2) > dl > div:nth-child(4) > dd").text();
    if (maintenanceFee) {
      maintenanceFee = extractors.moneyRate(maintenanceFee);
    }
    if (!_.isNumber(maintenanceFee)) {
      this.deferred.reject("Unable to parse maintenanceFee");
    }

    //Year built
    yearBuilt = this.$("#property_content_left > section:nth-child(2) > dl > div:nth-child(1) > dd").text();
    if (yearBuilt) {
      try {
        yearBuilt = parseInt(yearBuilt);
      } catch (err) {
        this.deferred.reject(err);
      }
    } else {
      this.deferred.reject("Unable to parse yearBuilt");
    }

    this.deferred.resolve({
      rent: rent,
      title: title,
      keyMoney: keyMoney,
      deposit: deposit,
      size: size,
      layout: layout,
      description: description,
      maintenance: maintenanceFee,
      yearBuilt: yearBuilt,
      stations: stations
    });
  }

});

var urls = [];
for (var i = 156079; i < 257079; i++) {
  urls.push("http://apartments.gaijinpot.com/en/rent/view/" + i);
}
urls.forEach(function (url) {
  new GaijinPotScraper(url).promise
  .then(
    function (data) {
      if (data.size > 30 && data.rent < 10000) {
        console.info(data);
      }
    },
    function (error) {
      if (error !== 404) {
        console.error(url);
      }
      console.error(error);
    });
});