/**
 * Simple extendable maybe monad for assisting in scraping
 */

var Empty = {
    defined: false,
    data: null,
    map: function (fn) { return this; },
    filter: function (fn) { return this; },
    bind: function (fn) { return this; },
    fMap: function (fn) { return this; },
    mapOr: function (fnIf, fnOr) {
      fnOr();
      return this;
    },
    fMapOr: function(fnIf, fnOr) {
      fnOr();
      return this;
    },
    getOrElse: function (fn) {
      if (typeof(fn) === "function") {
        return fn();
      } else {
        return fn;
      }
    }
};

var Full = function (data) {
  return {
    data: data,
    defined: true,
    map: function (fn) {
      try {
        return Full(fn(data));
      } catch (error) {
        console.error(error);
        return Empty;
      }
    },

    filter: function (fn) {
      var result = fn(data);
      if (result === true) return this;
      else return Empty;
    },

    bind: function (fn) {
      try {
        return Maybe(fn(data));
      } catch (err) {
        return Empty;
      }
    },

    fMap: function (fn) {
      try {
        return fn(data);
      } catch(error) {
        return Empty
      }
    },

    mapOr: function (fnIf, fnOr) {
      return this.map(fnIf);
    },

    fMapOr: function (fnIf, fnOr) {
      return this.fMap(fnIf);
    },

    getOrElse: function (fn) {
      return data;
    }
  }
}

var Maybe = function (data) {
  if (data !== null && data !== undefined) return Full(data);
  else return Empty;
}

module.exports = {
  Empty: Empty,
  Full: Full,
  Maybe: Maybe
};
