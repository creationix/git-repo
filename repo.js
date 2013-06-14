module.exports = createRepo;

// config options
// config.fs - provide a git-fs interface implementation
// config.db - provide a git-db interface implementation
// config.bare - boolean declaring this a bare repo (no staging area or working files)
// If you provide fs, but no db, a db interface that follows the cgit fs pattern will be used
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

  console.log({
    bare: bare,
    fs: fs,
    db: db
  });

}

