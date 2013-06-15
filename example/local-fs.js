#!/usr/bin/env node --harmony_generators

var gitRepo = require('../.');
var fs = require('min-fs');
var run = require('gen-run');
var consume = require('./stream-to-string.js');
var create = require('./string-to-stream.js');

run(function* main() {

  // Configure the repo API to work from a local clone.
  var repo = gitRepo({ fs: fs("./my-repo") });

  // Find out what sha1 hash HEAD points to
  console.log("Looking up hash that HEAD points to...");
  var masterHash = yield repo.readRef("HEAD");
  console.log("HEAD", masterHash);

  // Load that commit as an object
  var head = yield repo.load(masterHash);
  console.log(head);

  // Load the tree it points to
  var top = yield repo.load(head.commit.tree);
  console.log(top);

  // Load the README.md file in the tree
  var obj = yield repo.load(top.tree["README.md"].hash);
  console.log(obj);

  // Buffer the file stream to a string
  var text = yield consume(obj.blob.source);
  // Notice that hash is now defined
  console.log({ hash: obj.hash, body: text });


//   // Load an annotated tag
//   hash = yield repo.readRef("/refs/tags/test-tag");
//   console.log("test-tag", hash);
//
//   var tag = yield repo.load(hash);
//   console.log(tag);

  // Create a new file
  var hash = yield repo.save({
    hash: undefined,
    blob: {
      length: 12,
      source: create("Hello World\n")
    }
  });
  console.log("hash", hash);
  // Load it back
  var obj = yield repo.load(hash);
  console.log(obj);
  var text = yield consume(obj.blob.source);
  console.log({ hash: obj.hash, body: text });
  console.log("Should be 557db03de997c86a4a028e1ebd3a1ceb225be238");

  // save the file in the top directory under welcome.txt
  top.tree["welcome.txt"] = {
    mode: 0100644,
    hash: obj.hash
  };
  top.hash = undefined;
  var treeHash = yield repo.save(top);
  console.log("treeHash", treeHash);

  // Create a new commit object
  var newHead = yield repo.save({
    commit: {
      tree: treeHash,
      parent: masterHash,
      author: "Tim Caswell <tim@creationix.com> " + gitDate(new Date),
      committer: "Tim Caswell <tim@creationix.com> " + gitDate(new Date),
      message: "This is a commit created by js-git"
    }
  });
  console.log("newHead", newHead);
  yield repo.updateHead(newHead);

});


function gitDate(date) {
  var timezone = date.getTimezoneOffset() / 60;
  var seconds = Math.floor(date.getTime() / 1000);
  return seconds + " " + (timezone > 0 ? "-0" : "0") + timezone + "00";
}
