'use strict'

const crypto = require('crypto')

/**
 * @brief Returns a random string
 * @param {int} length - length of random string to generate
 * @param {string} chars - string of allowable characters
 * @return {string}
 * @throws {Error}
 */
const getRandom = function (length, chars) {
  if (!chars) {
    throw new Error(`Argument 'chars' is undefined`)
  }

  let charsLength = chars.length
  if (charsLength > 256) {
    throw new Error(`Argument 'chars' should not have more than 256 characters, 
      otherwise unpredictability will be broken`)
  }

  let randomBytes = crypto.randomBytes(length)
  let result = []

  let cursor = 0
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i]
    result[i] = chars[cursor % charsLength]
  }

  return result.join('')
}

module.exports.getRandom = getRandom
