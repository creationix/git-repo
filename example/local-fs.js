#!/usr/bin/env node --harmony_generators


var gitRepo = require('../.');
var minFs = require('min-fs');
var decode = require('../decode.js');
var run = require('gen-run');

var repo = gitRepo({
  fs: minFs("my-repo"),
});
var db = repo.db;

run(main);

function* main() {

  var hash = yield db.read("HEAD");
  console.log("HEAD", hash);

  var head = yield decode(db.load(hash));
  console.log(head);

  var tree = yield decode(db.load(head.commit.tree));
  console.log(tree);

  hash = yield db.read("/refs/tags/test-tag");
  console.log("test-tag", hash);

  var tag = yield decode(db.load(hash));
  console.log(tag);
}

