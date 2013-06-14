var bops = require('bops');

module.exports = decode;

// decode(source<binary>) -> continuable<object>
function decode(source) {
  var callback;
  
  function onRead(err, chunk) {
    if (err) return callback(err);
    console.log(chunk.toString());
  }
  
  return function (cb) {
    callback = cb;
    source(null, onRead);
  };
}

