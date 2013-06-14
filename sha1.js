var crypto = require('crypto');

module.exports = function () {
  var shasum = crypto.createHash('sha1');
  return function (data) {
    if (data) shasum.update(data);
    else return shasum.digest('hex');
  };
};