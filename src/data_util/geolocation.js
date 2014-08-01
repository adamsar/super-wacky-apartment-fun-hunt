/**
 * Geolocational utils for calculating the distance between points, etc.
 */

if (typeof(Number.prototype.toRadians) === "undefined") {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  }
}

var utils = {

    R: 6371,

    //Calculate the distance between two points
    //based on http://www.movable-type.co.uk/scripts/latlong.html
    distanceBetween: function (latLon1, latLon2) {
      var dLat = (latLon2.lat - latLon1.lat).toRadians(),
          dLon = (latLon2.lon - latLon2.lon).toRadians(),
          a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(latLon1.lat.toRadians()) * Math.cos(latLon2.lat.toRadians()) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = this.R * c; // Distance in km
      return d;
    }

};

module.exports = utils;