#!/usr/bin/env node --harmony_generators

var gitRepo = require('../.');
var minFs = require('min-fs');
var run = require('gen-run');
var consume = require('../stream-to-string.js');

run(function* main() {

  var repo = gitRepo({ fs: minFs("my-repo") });

  // Find out what sha1 hash HEAD points to
  var hash = yield repo.db.read("HEAD");
  console.log("HEAD", hash);

  // Load that commit as an object
  var head = yield repo.load(hash);
  console.log(head);

  // Load the tree it points to
  var top = yield repo.load(head.commit.tree);
  console.log(top);

  // Load the first file in the tree
  var obj = yield repo.load(top.tree[0].hash);
  console.log(obj);

  // Buffer the file stream to a string
  var text = yield consume(obj.blob.source);
  // Notice that hash is now defined
  console.log({ hash: obj.hash, body: text });


  // Load an annotated tag
  hash = yield repo.db.read("/refs/tags/test-tag");
  console.log("test-tag", hash);

  var tag = yield repo.load(hash);
  console.log(tag);

});
