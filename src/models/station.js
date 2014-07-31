//Train station modeling data

var model = require('model'),
    validators = require('../data_util/model_validators');

var Station = function () {
  var self = this;
  //"Japanese string" that includes kanji and kana
  ['name', 'line', 'address'].forEach(function (property) {
    self.property(property, 'object', { required: true });
    validators.validateJapaneseString(self, property);
  });

  this.property('lat', 'number', { required: true });
  this.property('lon', 'number', { required: true });
}

Station.prototype.toString = function () {
  return "Station(" + this.name.kanji + ", " + this.line.kanji + ", [" + this.lon + ", " + this.lat + "], " +
    this.address.kanji + ")";
}


Station = model.register('Station', Station);
module.exports = Station;