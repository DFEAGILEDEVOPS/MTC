'use strict'
const laCodeService = require('./la-code.service')

/**
 * @type {Object<number, string>}
 */
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
 * Determine if it is a temporary upn
 * @param {Array} protoUpn - a UPN without the initial check letter
 * @returns boolean
 */
function isTemporaryUpn (protoUpn) {
  if (protoUpn.length !== 12) {
    return false
  }
  const last = protoUpn[protoUpn.length - 1]
  if (last.length === 1 && last.match(/[A-Z]/)) {
    return true
  }
  return false
}

/**
 * Takes any number of args as input.  Do not supply char 1 of the UPN code
 * @return {Array}
 */
function multiplyByCharacterPosition (...theArgs) {
  if (isTemporaryUpn(theArgs)) {
    const letter = theArgs[11]
    /**
     * entry - key/val array pair [index: number, letter: string]
     */
    const entry = Object.entries(remainderLookup).find(a => a[1] === letter)
    if (entry && entry[0] !== undefined) {
      const letterValue = entry[0]
      // perform the replacement if we have a valid letter
      theArgs[11] = letterValue
    }
  }
  // convert to numbers
  const tail = theArgs.map(f => parseInt(f, 10))
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
