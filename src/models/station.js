//Train station modeling data

var model = require('model'),
    validators = require('../data_util/model_validators');

var Station = function () {

  //"Japanese string" that includes kanji and kana
  this.property('name', 'object', { required: true });
  this.property('line', 'object', { required: true });

  this.property('lat', 'number', { required: true });
  this.property('lon', 'number', { required: true });
  this.property('address', 'string', { required: true });

  validators.validateJapaneseString(this, 'name');
  validators.validateJapaneseString(this, 'line');
}

Station.prototype.toString = function () {
  return "Station(" + this.name.kanji + ", " + this.line.kanji + ", [" + this.lon + ", " + this.lat + "], " +
    this.address.kanji + ")";
}


Station = model.register('Station', Station);
module.exports = Station;