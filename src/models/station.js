//Train station modeling data

var model = require('model'),
    validators = require('../data_util/model_validators'),
    geolocation = require('../data_util/geolocation'),
    storeInMongo = require('../data_util/mongo_model');

var Station = function () {
  var self = this;
  //"Japanese string" that includes kanji and kana
  this.defineProperties({
    name: { type: 'object', required: true },
    address: { type: 'object', required: true },
    line: { type: 'object', required: true },
    lat: { type: 'number', required: true },
    lon: { type: 'number', required: true }
  });
//  this.setAdapter('mongo', {database: 'test', host: 'localhost'});
}

Station.prototype.toString = function () {
  return "Station(" + this.name.kanji + ", " + this.line.kanji + ", [" + this.lon + ", " + this.lat + "], " +
    this.address.kanji + ")";
}

//Return latitude and longitude as an object for that station
Station.prototype.latLon = function () {
  return {
    lat: this.lat,
    lon: this.lon
  };
}

//Return distance to the other specified station
Station.prototype.distanceTo = function (otherStation) {
  return geolocation.distanceBetween(this.latLon(), otherStation.latLon());
}

Station.prototype.toJson = function () {
  return {
    name: this.name,
    address: this.address,
    line: this.line,
    location: [this.lat, this.lon]
  }
}


Station = model.register('Station', Station);

storeInMongo(Station, 'stations', function (json) {
  return Station.create({
    name: json.name,
    address: json.address,
    line: json.line,
    lat: json.location[0],
    lon: json.location[1]
  });
}, 'name.kanji');

module.exports = Station;