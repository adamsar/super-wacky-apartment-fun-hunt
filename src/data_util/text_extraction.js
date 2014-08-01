/**
 * Text extraction utils
 */
var moneyReg = /(^| |￥|¥)\d+(,\d{3})*(\.\d*)?( |$)/,
    monthReg = /(^| )\d+(\.\d+)?( )?(mnth(s?)|month(s?)|mth(s?))( |$)/,
    numericReg = /\d+(\.\d)?/;

var findAll = function (text, reg) {
  var returns = [],
      textToSearch = text + "",
      matches = textToSearch.match(reg);
  while (matches != null) {
    returns.push(matches[0]);
    textToSearch = textToSearch.substr(textToSearch.indexOf(matches[0]) + matches[0].length);
    matches = textToSearch.match(reg);
  }

  return returns;
}

var moneyToInt = function (chunk) {
  var bareText = chunk.replace(/,| |￥|¥/g, '');
  return parseInt(bareText);
};


var AmbiguousExtractor = function (text) {
  var monthResult = findAll(text, monthReg),
      moneyResult = findAll(text, moneyReg);
  this.amount = null;
  this.months = null;
  if (monthResult.length > 0) {
    this.months = parseFloat(monthResult[0].match(numericReg)[0]);
  } else if (moneyResult){
    this.amount = moneyResult.map(moneyToInt)[0];
  }
}

AmbiguousExtractor.prototype.applyTo = function (baseAmount) {
  if (this.months) {
    return parseInt(baseAmount * this.months);
  } else {
    return this.amount;
  }
}

var extractors = {

    AmbiguousExtractor: AmbiguousExtractor,

    //Anything that could be construed as a mention to money
    moneyMentions: function (text) {
      return findAll(text, moneyReg).map(moneyToInt);
    }

};

module.exports = extractors;