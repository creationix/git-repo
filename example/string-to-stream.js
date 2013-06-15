var bops = require('bops');

module.exports = function (string) {
  var buffer = bops.from(string);
  var done = false;
  return function (close, callback) {
    if (close) return callback(close === true ? null : close);
    if (done) return callback();
    done = true;
    callback(null, buffer);
    buffer = undefined;
  };
};