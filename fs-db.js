var inflate = require('./inflate.js');
var deflate = require('./deflate.js');
var consume = require('./stream-to-string.js');
var sha1 = require('./sha1.js');

module.exports = function (fs) {

  return {
    root: fs.root,
    load: load,
    save: save,
    read: read,
    write: write,
    readSym: readSym,
    writeSym: writeSym,
    listObjects: listObjects,
    listRefs: listRefs,
    removeObject: removeObject,
    removeRef: removeRef
  };

  // load(hash) -> source<binary>
  function load(hash) {
    var path = "objects/" + hash.substr(0, 2) + "/" + hash.substr(2);
    return inflate(fs.read(path));
  }

  // save(source<binary>) -> continuable<hash>
  function save(source) {
    var tmp = (Math.random() * 0x100000000).toString(32) + Date.now().toString(32) + ".tmp";
    var sha1sum = sha1();
    var hash;

    // Tap the stream to record the sha1sum on the way through.
    function tapped(close, callback) {
      if (close) return source(close, callback);
      source(null, function (err, chunk) {
        if (chunk === undefined) {
          if (err) return callback(err);
          hash = sha1sum();
          callback();
        }
        else {
          sha1sum(chunk);
          callback(null, chunk);
        }
      });
    }

    return function (callback) {
      fs.write(tmp)(deflate(tapped))(function (err) {
        if (err) return callback(err);
        var path = "objects/" + hash.substr(0, 2) + "/" + hash.substr(2);
        fs.rename(tmp, path)(function (err) {
          if (err) return callback(err);
          callback(null, hash);
        });
      });
    };
  }

  // read(path) -> continauble<hash>
  function read(path) {
    return function (callback) {
      readSym(path)(onRead);
      function onRead(err, hash) {
        if (err) return callback(err);
        if (hash.substr(0, 4) === "ref:") {
          return readSym(hash.substr(4).trim())(onRead);
        }
        callback(null, hash.trim());
      }
    };
  }

  // write(path, hash) -> continuable
  function write(path, hash) {
    return function (callback) {
      throw new Error("TODO: Implement write()");
    };
  }

  // readSym(path) -> continable<path>
  function readSym(path) {
    return consume(fs.read(path));
  }

  // writeSym(path, target) -> continuable
  function writeSym(path, target) {
    return function (callback) {
      throw new Error("TODO: Implement writeSym()");
    };
  }

  // listObjects() -> source<hash>
  function listObjects() {
    throw new Error("TODO: Implement listObjects()");
  }

  // listRefs() -> source<path>
  function listRefs() {
    throw new Error("TODO: Implement listRefs()");
  }

  // removeObject(hash) -> continuable
  function removeObject(hash) {
    return function (callback) {
      throw new Error("TODO: Implement removeObject()");
    };
  }

  function removeRef(path) {
    return function (callback) {
      throw new Error("TODO: Implement removeRef()");
    };
  }

}
