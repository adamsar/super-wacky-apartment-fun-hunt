var chai = require('chai'),
    expect = chai.expect,
    should = chai.should,
    geolocation = require('../..//src/data_util/geolocation');

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
});