'use strict'

/** @namespace */

const laCodeService = require('./la-code.service')

const remainderLookup = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
  5: 'F',
  6: 'G',
  7: 'H',
  8: 'J',
  9: 'K',
  10: 'L',
  11: 'M',
  12: 'N',
  13: 'P',
  14: 'Q',
  15: 'R',
  16: 'T',
  17: 'U',
  18: 'V',
  19: 'W',
  20: 'X',
  21: 'Y',
  22: 'Z'
}

/**
 * Takes any number of args as input.  Do not supply char 1 of the UPN code
 * @return {Array}
 */
function multiplyByCharacterPosition () {
  // Convert all the arguments back into an array as numbers and discard
  // the first position
  const tail = [...arguments].map(f => parseInt(f, 10))
  // tail now contains only the digits
  // We need to return an array contain the multiplication product
  // of the digit multiplied by the character position, remembering that
  // we have removed the head, which was at index 0.  So the first character
  // would at index 0 is at character position 2.
  //
  // E.g.                H 8 0 1 2 0 0 0 0 1  0  0  1
  // Character number:   1 2 3 4 5 6 7 8 9 10 11 12 13
  return tail.map((f, idx) => {
    if (!Number.isInteger(f)) {
      return 0
    }
    return f * (idx + 2)
  })
}

const upnService = {

  /**
   *
   * @param {String} val - Entire UPN string minus the Check Code at the start
   * @return {*}
   */
  calculateCheckLetter: (val) => {
    // spread the string out into separate args
    const s1 = multiplyByCharacterPosition(...val)
    if (!s1.length) {
      return ''
    }
    const sum = s1.reduce((a, b) => a + b)
    const rem = sum % 23
    return remainderLookup[rem]
  },

  hasValidLaCode: async function (val) {
    const knownLaCodes = await laCodeService.getLaCodeSetOfStrings()
    const laCode = val.substring(1, 4)
    return knownLaCodes.has(laCode)
  }
}

module.exports = upnService
