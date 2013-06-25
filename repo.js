module.exports = createRepo;

var decode = require('./decode.js');
var encode = require('./encode.js');

// config options
// config.fs - provide a git-fs interface implementation
// config.db - provide a git-db interface implementation
// config.bare - boolean declaring this a bare repo
// If you provide fs, but no db, a db interface that uses the fs will be used.
// if you want a bare repo, the fs part can be omitted.
function createRepo(config) {
  var bare = !!config.bare;
  var init = !!config.init;
  var db = config.db;
  var fs = config.fs;
  if (!fs && !bare) {
    throw new Error("Full repos are required to have a fs backend");
  }
  if (!db && !fs) {
    throw new Error("Either a db or fs interface must be provided for bare repos");
  }
  if (!db) {
    if (bare) {
      db = require('./fs-db.js')(fs);
    }
    else {
      db = require('./fs-db.js')(fs(".git"));
    }
  }

  var repo = {
    bare: bare,
    db: db,
    load: load,
    save: save,
    readRef: readRef,
    updateHead: updateHead
  };
  if (!bare) {
    repo.fs = fs;
  }

  // load(hash) -> continuable<object>
  function load(hash) {
    return decode(db.load(hash));
  }

  // encode(object) -> continuable<hash>
  function save(object) {
    return db.save(encode(object));
  }

  // readRef(path) -> continuable<hash>
  // resolves symbolic refs
  function readRef(ref) {
    return function (callback) {
      db.read(ref)(onRead);
      function onRead(err, value) {
        if (err) return callback(err);
        if (value.substr(0, 4) === "ref:") {
          db.read(value.substr(4).trim())(onRead);
          return;
        }
        callback(null, value.trim());
      }
    };
  }

  // updateHead(hash) -> continuable
  // writes hash to whatever HEAD points to.
  function updateHead(hash) {
    return function (callback) {
      db.read("HEAD")(function (err, value) {
        if (err) return callback(err);
        if (value.substr(0, 4) !== "ref:") {
          return callback(new Error("HEAD must be symbolic ref"));
        }
        db.write(value.substr(4).trim(), hash + "\n")(callback);
      });
    };
  }

  if (init) {
    return function (callback) {
      db.init({ core: {
        repositoryformatversion: 0,
        filemode: true,
        bare: bare
      }})(function (err) {
        if (err) return callback(err);
        callback(null, repo);
      });
    };
  }
  return function (callback) {
    callback(null, repo);
  };

}

