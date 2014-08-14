/**
 * Model for some sort of dwelling that's on the market
 */

var model = require('model'),
    validators = require('../data_util/model_validators'),
    storeInMongo = require('../data_util/mongo_model'),
    Station = require('./station'),
    Maybe = require('../functional/maybe'),
    fns = require('../functional/fns'),
    _ = require('underscore');

var Edifice = function () {
  var self = this;
//  this.setAdapter('mongo');
  this.defineProperties({
    title: { type: 'string', required: true },
    address: { type: 'object',  required: false },
    rent: { type: 'number',  required: true },
    keyMoney: { type: 'number',  required: true },
    deposit: { type: 'number',  required: true},
    maintenanceFee: { type: 'number',  required: true},
    size: { type: 'number',  required: true },
    url: { type: 'string',  required: true },
    description: { type: 'string',  required: true },
    yearBuilt: { type: 'number',  required: false },
    costPerMonth: { type: 'number',  required: false},
    moveInCost: { type: 'number',  required: false },
    valid: { type: 'boolean',  required: true },
    stations: { type: 'object',  required: false},
    layout: { type: 'string',  require: true}
  });


//  validators.validateJapaneseString(this, 'address');
//  this.validatesFormat('type', validators.roomType);
 // validators.validateRange(1, 1000)(this, 'size');

  //Has to be a real number
//  ['rent', 'keyMoney', 'deposit', 'maintenanceFee'].forEach(function (property) {
//    validators.naturalNumber(self, property);
//  });
//  validators.isYear(this, 'yearBuilt');
//  validators.validateFormat('url', validators.urlRegex);
}

Edifice.prototype = _.extend(Edifice.prototype, {
  /**
   * Json representation of the edifice for storage in mongo
   */
  toJson: function () {
    return {
      title: this.title,
      address: this.address,
      rent: this.rent,
      keyMoney: this.keyMoney,
      deposit: this.deposit,
      maintenanceFee: this.maintenanceFee,
      size: this.size,
      layout: this.layout,
      url: this.url,
      description: this.description,
      yearBuilt: this.yearBuilt,
      costPerMonth: (this.costPerMonth || this.getCostPerMonth()),
      moveInCost: (this.moveInCost || this.getMoveInCost()),
      valid: this.valid,
      stations: _.map(this.stations, function (station) {
                  return {
                    _id: station._id,
                    name: station.name,
                    line: station.line,
                    location: [station.lon, station.lat]
                  };
                })
    };
  },

  /**
   * Get full station data from nearest stations from mongo,
   * do something with them.
   */
  stationsFull: function (handler) {
    Maybe(this.stations)
    .filter(fns.not(_.isEmpty))
    .map(function (stations) {
      return _.map(stations, function(station) {
               return station._id;
             });
    })
    .map(function (ids) { return { _id: { $in: ids } }; })
    .map(function (criteria) { Station.search(criteria, handler) });
  },

  /**
   * Returns the full cost (in yen) of what it would
   * take to move into the apartment
   */
  getMoveInCost: function () {
    if (this.moveInCost === undefined) {
      this.moveInCost = this.deposit + this.keyMoney;
    }
    return this.moveInCost;
  },

  /**
   * Total cost per month
   */
  getCostPerMonth: function () {
    if (this.costPerMonth === undefined) {
      return this.rent + this.maintenanceFee;
    }
    return this.costPerMonth;
  }

});

Edifice = model.register('Edifice', Edifice);
storeInMongo(Edifice, 'edifices', function (data) {
  return Edifice.create(data);
}, 'url', [{ "stations.location": "2d" }]);

module.exports = Edifice;