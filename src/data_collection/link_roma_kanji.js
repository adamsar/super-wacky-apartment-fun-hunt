/**
 * Read and link train names to their kana and romanji names
 */

var nconf = require('nconf'),
    fs = require('fs'),
    model = require('model'),
    Station = require('../models/station'),
    _ = require('underscore');

nconf.env()
.argv()
.file({file: './config.json'});

var trainMap = {},
    fileData = fs.readFileSync(nconf.get('trainMapPath')).toString('utf8');

//Build up map
_.each(fileData.split("\n"), function (data) {
  var entries = data.split(",");
  trainMap[entries[0]] = {
    kana: entries[1],
    romanji: entries[2]
  };
});

console.info(Station);
Station.search({}, function (stations) {
  _.each(stations, function (station) {
    var nameMapping = trainMap[station.name.kanji];
    if (nameMapping) {
      station.name = _.extend(station.name, nameMapping);
      station.update();
    } else {
      console.info("couldn't find: " + station.name.kanji);
    }
  });
});