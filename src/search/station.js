/**
 * Station searching utilities
 */
var q = require('q'),
    Station = require('../models/station'),
    _ = require('underscore');

var stationsForNames = function (names) {
  console.info(names);
  var deferred = q.defer(),
      nameCombinations = _.flatten(
        names.map( function (name) {
          return [
            { 'name.romanji': name },
            { 'name.kanji': name },
            { 'name.kana': name }
          ];
        })
      );
  Station.search({ $or:  nameCombinations }, function (stations) {
    deferred.resolve(stations);
  });
  return deferred.promise;
}

module.exports = {

  //Get stations corresponding to names
  stationsForNames: stationsForNames,

  //Get all stations near a certain station within a radius of maxDistance
  stationsNear: function (stationName, maxDistance) {
    var deferred = q.defer();

    stationsForNames([stationName]).then(
      function (station) {
        if (station.length === 0) {
          deferred.reject("No such station " + stationName);
        } else {
          var s = _.first(station),
              latLon = [s.lon, s.lat],
              distance = (maxDistance / 6378);
          Station.search(2000, {
            location: {
              $nearSphere: latLon,
              $maxDistance: distance
            }
          }, function (stations) {
               console.info(stations.length);
               stations.forEach(function (e) { console.info(e.name.romanji); });
               deferred.resolve(stations);
             });
        }
      },
      function (error) { deferred.reject(error) });
    return deferred.promise;
  }
};