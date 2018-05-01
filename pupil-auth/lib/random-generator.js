'use strict'

const crypto = require('crypto')
const randomNumber = require('random-number-csprng')

const random = {
  /**
   * @description Returns a random string
   * @param {int} length - length of random string to generate
   * @param {string} chars - string of allowable characters
   * @return {string}
   * @throws {Error}
   */
  getRandom: function (length, chars) {
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
  },

  /**
   * @description Get a cryptographically secure random number in a range (inclusive)
   * By wrapping this function we also make it testable
   * It can also be swapped out for other implementations
   * @param {int} min - minimum integer in the range inclusive
   * @param {int} max = maximum integer in the range inclusive
   * @return {Promise.<number>}
   */
  getRandomIntInRange: async function (min, max) {
    return randomNumber(min, max)
  }
}

module.exports = random
