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

  var commit = yield decode(db.load(hash));
  console.log(commit);

}

