/**
 * Extra validation for internal data types (JapaneseString) and what not
 * { romanji: '', kanji: '', kana: '' }
 */

var _ = require('underscore');

var romanjiRegex = /^[\x00-\x7F]*$/,
    kanjiRegex = /^[\x3400-\x4DB5\|x4E00-\x9FCB\xF900-\xFA6A]*$/,
    kanaRegex = /^[\x30A0-\x30FF]*$/

var roomTypes = /^\d(Ss|Ll|Dd|Kk)+$/,
    urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;

var contextSensative = function (fn) {
  var apply = function(context, attr) {
    context.validatesWithFunction(context, attr, fn);
  }
  return apply;
};

var validators = {
  //Regex for roomTypes
  roomTypes: roomTypes,
  urlRegex: urlRegex,

  //Validates that a JapaneseString object is in the proper form
  validateJapaneseString: contextSensative(
    function (value) {
      var valid = true;
      if (value.romanji) {
        valid = valid && romanjiRegex.test(value.romanji);
      }
      if (value.kanji) {
        valid = valid && kanjiRegex.test(value.kanji);
      }
      if (value.kana) {
        valid = valid && kanjiRegex.test(value.kana);
      }
      return valid;
    }),

  //Validates number falls in the range of values
  validatesRange: function (start, end) {
    return contextSensative(function (value) {
             return (_.isNumber(value) &&
                     value >= start &&
                     value <= end);

           });
  },

  naturalNumber: contextSensative(function (value) { return value >= 0; })
};



module.exports = validators;