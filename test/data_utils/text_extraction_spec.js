var chai = require('chai'),
    expect = chai.expect,
    should = chai.should,
    extractors = require('../../src/data_util/text_extraction');

describe("Text extraction", function () {

    it("returns all mentions of money, properly parse, in text", function () {
      expect(extractors.moneyMentions("Rent:¥650,000            ")).to.deep.equal([650000]);
    });



    it("returns an amount relative to months if specified", function () {
      expect(new extractors.AmbiguousExtractor("1 mths").applyTo(100)).to.equal(100);
      expect(new extractors.AmbiguousExtractor("0 mths").applyTo(100)).to.equal(0);
      expect(new extractors.AmbiguousExtractor("1.5 months in Tibet").applyTo(100)).to.equal(150);
    });

  describe("extract size", function () {
    it("should return the size of the room", function () {
      expect(parseInt(extractors.size("140.69 m²"))).to.equal(140);
    });
  });

  describe("moneyRate extractor", function () {
    expect(extractors.moneyRate("¥0 / mth")).to.equal(0);
    expect(extractors.moneyRate("¥102 / mth")).to.equal(102);
    expect(extractors.moneyRate("¥1,203 / mth")).to.equal(1203);
  });
});