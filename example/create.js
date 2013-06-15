#!/usr/bin/env node --harmony_generators

var gitRepo = require('../.');
var fs = require('min-fs');
var run = require('gen-run');
var create = require('./string-to-stream.js');

// Mock data for creating generating some history
var author = "Tim Caswell <tim@creationix.com>";
var committer = "JS-Git <js-git@creationix.com>";
var commits = {
  "Initial Commit\n": {
    "README.md": "# This is a test Repo\n\nIt's generated entirely by JavaScript\n"
  },
  "Add package.json and blank module\n": {
    "README.md": "# This is a test Repo\n\nIt's generated entirely by JavaScript\n",
    "package.json": '{\n  "name": "awesome-lib",\n  "version": "3.1.3",\n  "main": "awesome.js"\n}\n',
    "awesome.js": 'module.exports = function () {\n  throw new Error("TODO: Implement Awesome");\n};\n'
  },
  "Implement awesome and bump version to 3.1.4\n": {
    "README.md": "# This is a test Repo\n\nIt's generated entirely by JavaScript\n",
    "package.json": '{\n  "name": "awesome-lib",\n  "version": "3.1.4",\n  "main": "awesome.js"\n}\n',
    "awesome.js": 'module.exports = function () {\n  return 42;\n};\n'
  }
};


run(function* main() {

  // Configure the repo API to work from a local clone.
  var repo = gitRepo({ fs: fs("./test-repo.git"), bare: true});
  // Initialize the repo.
  // TODO: move this logic into gitRepo with an { init: true } flag
  yield repo.db.mkdir(".");
  yield parallel(
    repo.db.mkdir("branches"),
    repo.db.write("config", '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = true\n'),
    repo.db.write("description", 'Unnamed repository; edit this file \'description\' to name the repository.\n'),
    repo.db.write("HEAD", "ref: refs/heads/master\n"),
    repo.db.mkdir("hooks"),
    repo.db.mkdir("info"),
    repo.db.mkdir("objects"),
    repo.db.mkdir("refs")
  );
  yield parallel(
    repo.db.write("info/exclude", "'# git ls-files --others --exclude-from=.git/info/exclude\n# Lines that start with \'#\' are comments.\n# For a project mostly in C, the following would be a good set of\n# exclude patterns (uncomment them if you want to use them):\n# *.[oa]\n# *~\n'"),
    repo.db.mkdir("objects/info"),
    repo.db.mkdir("objects/pack"),
    repo.db.mkdir("refs/heads"),
    repo.db.mkdir("refs/tags")
  );
  console.log("Git database Initialized");

  
  var parent;
  yield* each(commits, function* (message, files) {
    // Start building a tree object.
    var tree = {};
    yield* each(files, function* (name, contents) {
      // Save the file in the database and store the hash in the tree data.
      tree[name] = {
        mode: 0100644,
        hash: yield repo.save({
          blob: {
            length: contents.length,
            source: create(contents)
          }
        })
      };
    });
    var commit = {
      tree: yield repo.save({tree: tree}),
      parent: parent,
      author: author + " " + gitDate(new Date),
      committer: committer + " " + gitDate(new Date),
      message: message
    };
    if (!parent) delete commit.parent;
    parent = yield repo.save({commit: commit});
    yield repo.updateHead(parent);
  });

});

// Generator friendly forEach for objects
function* each(object, callback) {
  var keys = Object.keys(object);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    yield* callback(key, object[key]);
  }
}

// Run several continuables in parallel
function parallel() {
  var continuables = Array.prototype.slice.call(arguments);
  return function (callback) {
    var left = continuables.length + 1;
    var isDone = false;
    continuables.forEach(function (continuable) {
      continuable(function (err) {
        if (err) return done(err);
        check();
      });
    });
    check();
    function done(err) {
      if (isDone) return;
      isDone = true;
      callback(err);
    }
    function check() {
      if (--left) return;
      done();
    }
  };
}

// Format a js data object into the data format expected in git commits.
function gitDate(date) {
  var timezone = date.getTimezoneOffset() / 60;
  var seconds = Math.floor(date.getTime() / 1000);
  return seconds + " " + (timezone > 0 ? "-0" : "0") + timezone + "00";
}

