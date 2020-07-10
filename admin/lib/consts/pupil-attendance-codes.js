const deepFreeze = require('../deep-freeze')

module.exports = deepFreeze(
  {
    absent: { code: 'ABSNT' },
    leftSchool: { code: 'LEFTT' },
    incorrectRegistration: { code: 'INCRG' },
    unableToAccess: { code: 'NOACC' },
    workingBelowExpectation: { code: 'BLSTD' },
    justArrived: { code: 'JSTAR' }
  }
)
