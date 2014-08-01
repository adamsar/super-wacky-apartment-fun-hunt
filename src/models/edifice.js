/**
 * Model for some sort of dwelling that's on the market
 */

var model = require('model'),
    validators = require('../data_util/model_validators');

var Edifice = function () {
  var self = this;
  this.setAdapter('sqlite');
  this.property('title', 'string', { required: true });
  this.property('address', 'object', { required: false });
  this.property('rent', 'number', { required: true });
  this.property('keyMoney', 'number', { required: true });
  this.property('deposit', 'number', { required: true});
  this.property('maintenanceFee', 'number', { required: true});
  this.property('size', 'number', { required: true });
  this.property('type', 'string', { required: true});
  this.property('rooms', 'number', { required: true });
  this.property('url', 'string', { required: true });
  this.property('description', 'string', { required: true });

  validators.validateJapaneseString(this, 'address');
  this.validatesFormat('type', validators.roomType);
  validators.validateRange(1, 1000)(this, 'size');

  //Has to be a real number
  ['rent', 'keyMoney', 'deposit', 'maintenanceFee'].forEach(function (property) {
    validators.naturalNumber(self, property);
  });
  validators.validateFormat('url', validators.urlRegex);
}

model.exports = Edifice;