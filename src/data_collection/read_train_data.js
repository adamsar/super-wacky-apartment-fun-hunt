/**
 * Read in train data in order to query apartment sites
 */

var nconf = require('nconf'),
    fs = require('fs'),
    model = require('model'),
    JapaneseName = require('../data_util/japanese_name'),
    Station = require('../models/station'),
    _ = require('underscore');

nconf.file({ file: '../../config.json' })


//Set default adapter on models
//model.config.defaultAdapter(nconf.get('database'), {
//  host: nconf.get('databaseHost')
//  username: nconf.get('databaseUser'),
//  database: nconf.get('databasePassword')
//});

var isTruthy = function (value) { return !_.isEmpty(value) },
    buildMatrix = function (fileName) {
      var data = fs.readFileSync(fileName).toString('utf8');

      return _.chain(data.split("\n").splice(1))
             .map(function (data) { return data.split(","); })
             .filter(isTruthy)
             .value();
    }

var lineData = buildMatrix('resource/lines.csv'),
    trainData = buildMatrix('resource/trains.csv'),
    lineMap = {};

//Get mapping of lineId: lineName
lineData.forEach(function (line) {
  var lineId = line[0],
      lineNameKanji = line[2],
      lineNameKana = line[3];

  lineMap[lineId] = new JapaneseName(line[2], line[3], null);
});

//For each chunk of data after the initial, make Station object, save
trainData.forEach(function (info) {
  var name = new JapaneseName(info[2], null, null),
      line = lineMap[info[5]],
      address = new JapaneseName(info[8], null, null),
      lon = parseFloat(info[9]),
      lat = parseFloat(info[10]),
      station = null;

  if (isTruthy(line)) {
      station = Station.create({
        name: name.asObject(),
        line: line.asObject(),
        address: address,
        lon: lon,
        lat: lat
      });
    console.info(station.toString());
  }
});