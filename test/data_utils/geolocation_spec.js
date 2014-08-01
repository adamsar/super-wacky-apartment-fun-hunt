var chai = require('chai'),
    expect = chai.expect,
    should = chai.should,
    geolocation = require('../../src/data_util/geolocation'),
    Station = require('../../src/models/station');

describe("Geolocational tools", function () {
  describe("distanceBetween", function () {
    it("should return the proper distance between two latLon objects", function () {
      var pair1 = {
          lat: 50.0359,
          lon: 5.4253
      },
          pair2 = {
            lat: 58.3838,
            lon: 3.0412
          };
      expect(parseInt(geolocation.distanceBetween(pair1, pair2))).to.equal(928);
    });
  });

  describe ("When applied on stations", function () {
    it("should return the correct distance to the next station", function () {
      var station1 = Station.create({
            name: {
              romanji: "nishikasai"
            },
            line: "Tokyo metro",
            address: "edogawa-ku",
            lat: 139.859259,
            lon: 35.664631
          }),
          station2 = Station.create({
            name: {
              romanji: "roppongi itchome"
            },
            line: "Tokyo metro",
            address: "minato-ku",
            lat: 139.739,
            lon: 35.665595
          }),
          station3 = Station.create({
            name: {
              romanji: "kouenji"
            },
            line: "sobu",
            address: "sumidaku",
            lat: 139.649664,
            lon: 35.705326
          });
      expect(parseInt(station1.distanceTo(station2))).to.equal(13);
      expect(parseInt(station2.distanceTo(station3))).to.equal(9);
    });
  });
});