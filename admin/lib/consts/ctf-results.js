const deepFreeze = require('../deep-freeze')

/**
 * Dfe Codes
 */

module.exports = deepFreeze({
  absent: { code: 'A' },
  leftSchool: { code: 'L' },
  incorrectRegistration: { code: 'Z' },
  unableToAccess: { code: 'U' },
  workingBelowExpectation: { code: 'B' },
  justArrived: { code: 'J' },
  notTaken: { code: 'X' },
  notAbleToAdminister: { code: 'NAA' },
  maladministration: { code: 'Q' },
  pupilCheating: { code: 'H' }
})
