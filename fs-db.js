var inflate = require('./inflate.js');
var deflate = require('./deflate.js');

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
    return function (callback) {
      throw new Error("TODO: Implement save()");
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

// consume(source<binary>) -> continuable<binary_encoded_string>
function consume(source) {
  return function (callback) {
    var data = "";
    var sync;
    start();
    function start() {
      do {
        sync = undefined;
        source(null, onRead);
        if (sync === undefined) sync = false;
      } while (sync);
    }
    function onRead(err, item) {
      if (item === undefined) return onEnd(err);
      for (var i = 0, l = item.length; i < l; i++) {
        data += String.fromCharCode(item[i]);
      }
      if (sync === undefined) sync = true;
      else start();
    }
    function onEnd(err) {
      if (err) return callback(err);
      callback(null, data);
    }
  };
}