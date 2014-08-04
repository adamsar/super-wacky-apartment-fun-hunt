//Functional helpers for mapping
var _ = require('underscore');

module.exports = {
  not: function (fn) { return function (value) { return !fn(value); } }
}