/**
 * Generic utilities library for text manipulation.
 */

var capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {

  capitalize: capitalize,

  formatStationName: function (name) {
    return capitalize(name.replace(" Station", "").replace(/( |-)/g, '').toLowerCase());
  }
};