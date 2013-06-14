var gitRepo = require('../.');
var minFs = require('min-fs');

gitRepo({
  fs: minFs("my-repo")
});