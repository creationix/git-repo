module.exports = consume;

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
