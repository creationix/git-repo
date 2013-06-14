var sha1 = require('./sha1.js');

module.exports = decode;

var parser = {
  name: function (byte) {
    if (byte !== 0x20) {
      this.type += String.fromCharCode(byte);
      return "name";
    }
    return "length";
  },
  length: function (byte) {
    if (byte !== 0x00) {
      this.length = this.length * 10 + byte - 0x30;
      return "length";
    }
    if (this.type === "tree") this.data = [];
    else {
      this.data = {};
      if (this.type === "blob") this.data.length = this.length;
    }
    return this.type;
  },
  commit: function (byte) {
    this.key = String.fromCharCode(byte);
    this.value = "";
    this.data.parents = [];
    this.data.message = "";
    return "key";
  },
  key: function (byte) {
    if (byte === 0x0a) {
      return "message";
    }
    if (byte !== 0x20) {
      this.key += String.fromCharCode(byte);
      return "key";
    }
    return "value";
  },
  value: function (byte) {
    if (byte !== 0x0a) {
      this.value += String.fromCharCode(byte);
      return "value";
    }
    var data = this.data;
    if (this.key === "parent") {
      data.parents.push(this.value);
    }
    else data[this.key] = this.value;
    this.key = "";
    this.value = "";
    return "key";
  },
  message: function (byte) {
    this.data.message += String.fromCharCode(byte);
    return "message";
  },
  tree: function (byte) {
    this.mode = byte - 0x30;
    this.path = "";
    this.hash = "";
    return "mode";
  },
  mode: function (byte) {
    if (byte !== 0x20) {
      this.mode = this.mode * 8 + byte - 0x30;
      return "mode";
    }
    return "path";
  },
  path: function (byte) {
    if (byte !== 0x00) {
      this.path += String.fromCharCode(byte);
      return "path";
    }
    return "hash";
  },
  hash: function (byte) {
    if (byte < 0x10) this.hash += "0" + byte.toString(16);
    else this.hash += byte.toString(16);
    if (this.hash.length < 20) return "hash";
    this.data.push({
      mode: this.mode,
      path: this.path,
      hash: this.hash
    });
    this.mode = 0;
    this.path = "";
    this.hash = "";
    return "mode";
  },
  blob: function (byte) {
    throw new Error("TODO: Implement blob state");
  },
  tag: function (byte) {
    this.key = String.fromCharCode(byte);
    this.value = "";
    this.data.message = "";
    return "key";
  }
};

// decode(source<binary>) -> continuable<object>
function decode(source) {
  var callback;
  var state = "name";
  var data = {
    type: "",
    length: 0
  };
  var shasum = sha1();

  function onRead(err, chunk) {
    if (chunk === undefined) {
      if (err) return callback(err);
      var obj = {
        hash: shasum()
      };
      obj[data.type] = data.data;
      return callback(err, obj);
    }
    shasum(chunk);
    for (var i = 0, l = chunk.length; i < l; i++) {
      state = parser[state].call(data, chunk[i]);
    }
    source(null, onRead);
  }

  return function (cb) {
    callback = cb;
    source(null, onRead);
  };
}

