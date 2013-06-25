#!/usr/bin/env node --harmony_generators

var gitRepo = require('../.');
var fs = require('min-fs');
var run = require('gen-run');
var consume = require('./stream-to-string.js');

run(function* main() {
  
  // Configure the repo API to work from a local clone.
  var repo = yield gitRepo({ fs: fs("./test-repo.git"), bare: true});

  console.log("Looking up hash that HEAD points to...");
  var hash = yield repo.readRef("HEAD");

  console.log("Walking linear commit history back to first commit...");
  do {
    var obj = yield repo.load(hash);
    console.log("\n\nCommit: " + obj.hash);
    var commit = obj.commit;
    log(commit);

    obj = yield repo.load(commit.tree);
    console.log("\nTree: " + obj.hash);
    // log(obj.tree);
    
    yield* each(obj.tree, function* (name, data) {
      obj = yield repo.load(data.hash);
      var blob = obj.blob;
      log({
        mode: data.mode,
        name: name,
        hash: data.hash
      });
      log(blob);
      log(yield consume(blob.source));
    });
    
    hash = commit.parents[0];
  } while(hash);
  
  console.log("\nDone");

});

var inspect = require('util').inspect;
function log(obj) {
  console.log(inspect(obj, { colors:true }));
}

// Generator friendly forEach for objects
function* each(object, callback) {
  var keys = Object.keys(object);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    yield* callback(key, object[key]);
  }
}

