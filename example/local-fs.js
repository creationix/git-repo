#!/usr/bin/env node --harmony_generators

var gitRepo = require('../.');
var minFs = require('min-fs');
var run = require('gen-run');
var consume = require('../stream-to-string.js');

run(function* main() {

  var repo = gitRepo({ fs: minFs("my-repo") });

  // Get the first file from the top tree in HEAD
  var hash = yield repo.db.read("HEAD");
  console.log("HEAD", hash);
  var head = yield repo.load(hash);
  console.log(head);
  var tree = yield repo.load(head.commit.tree);
  console.log(tree);
  var blob = yield repo.load(tree.tree[0].hash);
  console.log(blob);
  var text = yield consume(blob.blob.source);
  console.log({hash:blob.hash,body:text});

  // Load an annotated tag
  hash = yield repo.db.read("/refs/tags/test-tag");
  console.log("test-tag", hash);
  var tag = yield repo.load(hash);
  console.log(tag);
});
