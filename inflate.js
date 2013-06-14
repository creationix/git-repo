var zlib = require('zlib');

module.exports = inflate;

// inflate(source<deflated_binary>) -> source<binary>
function inflate(read) {
  var dataQueue = [];
  var readQueue = [];
  var reading = false, done = false;

  var inf = new zlib.Inflate();
  inf.on("error", onError);
  inf.on("data", onData);

  function onError(err) {
    dataQueue.push([err]);
    check();
  }

  function onData(chunk) {
    dataQueue.push([null, chunk]);
    check();
  }

  function check() {
    while (readQueue.length && dataQueue.length) {
      readQueue.shift().apply(null, dataQueue.shift());
    }

    if (!reading && readQueue.length) {
      reading = true;
      read(null, onRead);
    }
  }

  function onRead(err, chunk) {
    reading = false;
    if (chunk === undefined) {
      done = true;
      dataQueue.push([err]);
    }
    else inf.write(chunk);
    check();
  }

  return function (close, callback) {
    if (close) return read(close, callback);
    readQueue.push(callback);
    check();
  };
}