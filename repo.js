module.exports = createRepo;

var decode = require('./decode.js');

// config options
// config.fs - provide a git-fs interface implementation
// config.db - provide a git-db interface implementation
// config.bare - boolean declaring this a bare repo
// If you provide fs, but no db, a db interface that uses the fs will be used.
// if you want a bare repo, the fs part can be omitted.
function createRepo(config) {
  var bare = !!config.bare;
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
    save: save
  };
  if (!bare) {
    repo.fs = fs;
  }

  // load(hash) -> continuable<object>
  function load(hash) {
    return decode(db.load(hash));
  }

  function save(object) {
    throw new Error("TODO: Implement save")
  }


  return repo;

}

