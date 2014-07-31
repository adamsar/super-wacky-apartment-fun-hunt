/**
 * Utility class for Japanese names;
 */
var JapaneseName = function (kanji, kana, romanji) {
  this.kanji = kanji;
  this.kana = kana;
  this.romanji = romanji;
}

JapaneseName.prototype.asObject = function () {
  return {
    kanji: this.kanji,
    romanji: this.romanji,
    kana: this.kana
  };
}

//TODO
JapaneseName.prototype.lookupKana = function () {}

//TODO
JapaneseName.prototype.lookupRomanji = function () {}

module.exports = JapaneseName;