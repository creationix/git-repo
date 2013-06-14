var bops = require('bops');

module.exports = encode;

// encode(object) -> source<binary>
function encode(obj) {
  if (obj.commit) return wrap("commit", obj);
  else if (obj.tree) return wrap("tree", obj);
  else if (obj.blob) return wrap("blob", obj);
  else if (obj.tag) return wrap("tag", obj);
  else throw new Error("Unknown object type, must be commit, tree, blob, or tag");
}

function wrap(type, obj) {
  return encoders[type](obj[type]);
}

function toStream(type, str) {
  str = type + " " + str.length.toString(10) + "\0" + str;
  str = bops.from(str, "binary");
  var done = false;
  return function (close, callback) {
    if (close) return callback(close === true ? null : close);
    if (done) return callback();
    done = true;
    callback(null, str);
    str = undefined;
  };
}

var encoders = {
  commit: function (commit) {
    var str = "";
    Object.keys(commit).forEach(function (key) {
      var value = commit[key];
      if (key === "parents") {
        value.forEach(function (value) {
          str += "parent " + value + "\n";
        });
      }
      else {
        str += key + " " + value + "\n";
      }
    });
    return toStream(str + "\n" + commit.message);
  },
  tree: function (tree) {
    throw new Error("TODO: Implement tree encoding");
  },
  blob: function (blob) {
    var first = bops.from("blob " + blob.length.toString(10) + "\0");
    var started = false;
    return function (close, callback) {
      if (close) return callback(close === true ? null : close);
      if (started) return blob.source(close, callback);
      started = true;
      callback(null, first);
      first = undefined;
    };
  },
  tag: function (tag) {
    var str = "";
    Object.keys(tag).forEach(function (key) {
      var value = tag[key];
      str += key + " " + value + "\n";
    });
    return toStream(str + "\n" + tag.message);
  }
};