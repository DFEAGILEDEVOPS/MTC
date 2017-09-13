'use strict'

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

function multiplyByCharacterPosition () {
  // Convert all the arguments back into an array as numbers and discard
  // the first position
  const [, ...tail] = [...arguments].map(f => parseInt(f, 10))
  // tail now contains only the digits
  // We need to return an array contain the multiplication product
  // of the digit multiplied by the character position, remembering that
  // we have removed the head, which was at index 0.  So the first character
  // would at index 0 is at character position 2.
  //
  // E.g.                H 8 0 1 2 0 0 0 0 1  0  0  1
  // Character number:   1 2 3 4 5 6 7 8 9 10 11 12 13
  return tail.map((f, idx) => f * (idx + 2))
}

module.exports = {
  customValidators: {
    upnHasCorrectCheckLetter: (val, options = {}) => {
      if (!(/^[A-Z]\d{12}$/.test(val))) {
        return false
      }
      // step 1: multiply all digits by the 'character position'
      // spread the string out into separate args
      const s1 = multiplyByCharacterPosition(...val)
      const sum = s1.reduce((a, b) => a + b)
      const rem = sum % 23
      const expected = remainderLookup[rem]
      if (expected !== val[0]) {
        return false
      }
      return true
    }
  }
}
