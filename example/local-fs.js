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

  // Get the first file from the top tree in HEAD
  var hash = yield db.read("HEAD");
  console.log("HEAD", hash);
  var head = yield decode(db.load(hash));
  console.log(head);
  var tree = yield decode(db.load(head.commit.tree));
  console.log(tree);
  var blob = yield decode(db.load(tree.tree[0].hash));
  console.log(blob);
  var text = yield consume(blob.blob.source);
  console.log({hash:blob.hash,body:text});

  // Load an annotated tag
  hash = yield db.read("/refs/tags/test-tag");
  console.log("test-tag", hash);
  var tag = yield decode(db.load(hash));
  console.log(tag);
}

// consume(source<binary>) -> continuable<binary_encoded_string>
function consume(source) {
  return function (callback) {
    var data = "";
    var sync;
    start();
    function start() {
      do {
        sync = undefined;
        source(null, onRead);
        if (sync === undefined) sync = false;
      } while (sync);
    }
    function onRead(err, item) {
      if (item === undefined) return onEnd(err);
      for (var i = 0, l = item.length; i < l; i++) {
        data += String.fromCharCode(item[i]);
      }
      if (sync === undefined) sync = true;
      else start();
    }
    function onEnd(err) {
      if (err) return callback(err);
      callback(null, data);
    }
  };
}