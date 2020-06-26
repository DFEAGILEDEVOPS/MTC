const deepFreeze = require('../deep-freeze')

module.exports = deepFreeze({
  absent: { code: 'A' },
  workingBelowExpectation: { code: 'B' },
  justArrived: { code: 'J' },
  left: { code: 'L' },
  annulled: { code: 'Q' },
  unableToAccess: { code: 'U' },
  notTaken: { code: 'X' },
  incorrectRegistration: { code: 'Z' }
})
