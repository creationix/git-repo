var bops = require('bops');

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
    throw new Error("TODO: Implement tree state");
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

  function onRead(err, chunk) {
    if (chunk === undefined) {
      if (err) return callback(err);
      var obj = {};
      obj[data.type] = data.data;
      return callback(err, obj);
    }
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

