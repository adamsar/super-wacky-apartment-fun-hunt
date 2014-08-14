/***
 * Utility methods for storing objects in mongo using Mongouse
 */

var $ = require('mongous').Mongous,
    _ = require ('underscore'),
    ObjectID = require('mongodb').ObjectID;

var setKey = function (key, object) {
  var dict = {},
      parts = key.split('.'),
      first = _.first(parts),
      remaining = parts.slice(1).join(".");

  //Split into chunks by periods
  if (!_.isEmpty(remaining)) {
    dict[first] = setKey(remaining, object[first]);
    return dict;
  } else {
    dict[first] = object[first];
    return dict;
  }
}

var storeInMongo = function (obj, collectionName, unmarshalCb, key, indexes) {
  var collection = $("apartments." + collectionName),
      constructor = function (document) {
        var object = unmarshalCb(document);
        if (object !== null) {
          object._id = document._id;
        }
        return object;
      }

  //Set indexes
  $("apartments.$cmd").find({
    createdIndexes: collectionName,
    indexes: indexes
  }, 1);

  obj.prototype.add = function () {
    var json = this.toJson(),
        search = {};
    if (key !== undefined) {
      search = setKey(key, json);
      collection.find(search, function (reply) {
        if (reply.documents.length === 0) {
          collection.save(json);
        } else {
          json = _.extend(_.first(reply.documents), json);
          collection.save(json);
        }
      });
    } else {
      collection.save(json);
    }
  }

  obj.prototype.update = function () {
    var json = this.toJson(),
        search = {};

    //Check id and/or key
    if (this._id !== undefined) {
      search = { _id: this._id };
    } else if (key !== undefined) {
      search = setKey(key, json);
    }
    if (!_.isEmpty(search)) {
      collection.find(search, function (reply) {
        if (reply.documents.length === 0) {
          console.error("Unable to update object " + key + " does not exist");
        } else {
          collection.update(search, _.extend(reply.documents[0], json));
        }
      });
    } else {
      //Can't update what isn't able to be looked up
      console.error("Unable to look up object, NOT saving");
    }
  }

  obj.search = function () {
    var reply = _.last(arguments),
    newReply =  function (results) {
      reply(_.map(results.documents, constructor));
    }
    arguments[arguments.length - 1] = newReply;
    return collection.find.apply(collection, arguments);
  };
}

module.exports = storeInMongo