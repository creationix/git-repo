var zlib = require('zlib');

module.exports = deflate;

// deflate(source<binary>) -> source<deflated_binary>
function deflate(read) {
  return function (close, callback) {
    throw new Error("TODO: Implement deflate filter");
  };
}