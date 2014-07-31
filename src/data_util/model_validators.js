/**
 * Extra validation for internal data types (JapaneseString) and what not
 * { romanji: '', kanji: '', kana: '' }
 */

var romanjiRegex = /^[\x00-\x7F]*$/,
    kanjiRegex = /^[\x3400-\x4DB5\|x4E00-\x9FCB\xF900-\xFA6A]*$/,
    kanaRegex = /^[\x30A0-\x30FF]*$/

//Validates that a JapaneseString object is in the proper form
exports.validateJapaneseString = function (context, attr) {
  context.validatesWithFunction(attr, function (value) {
    var valid = true;
    if (context.romanji) {
      valid = valid && romanjiRegex.test(context.romanji);
    }
    if (context.kanji) {
      valid = valid && kanjiRegex.test(context.kanji);
    }
    if (context.kana) {
      valid = valid && kanjiRegex.test(context.kana);
    }
    return valid;
  });
}