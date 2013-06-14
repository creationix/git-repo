module.exports = function (fs) {

  return {
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
    throw new Error("TODO: Implement load()");
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
      throw new Error("TODO: Implement read()");
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
    return function (callback) {
      throw new Error("TODO: Implement readSym()");
    };
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
