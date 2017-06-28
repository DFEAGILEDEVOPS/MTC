var crypto = require('crypto');
'use strict';

/**
 * @brief Returns a random string
 * @param {int} length  length of random string to generate
 * @param {string} chars  of allowable characters
 * @return {string}
 * @throws {Error}
 */
module.exports.getRandom = function (length, chars) {
  if (!chars) {
    throw new Error(`Argument 'chars' is undefined`);
  }

  var charsLength = chars.length;
  if (charsLength > 256) {
    throw new Error(`Argument 'chars' should not have more than 256 characters, 
      otherwise unpredictability will be broken`);
  }

  var randomBytes = crypto.randomBytes(length);
  var result = [];

  var cursor = 0;
  for (var i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % charsLength];
  }

  return result.join('');
};
