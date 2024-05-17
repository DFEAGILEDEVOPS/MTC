const deepFreeze = require('../deep-freeze')

/**
 * MTC Codes
 */
module.exports = deepFreeze(
  {
    absent: { code: 'ABSNT' },
    leftSchool: { code: 'LEFTT' },
    incorrectRegistration: { code: 'INCRG' },
    unableToAccess: { code: 'NOACC' },
    workingBelowExpectation: { code: 'BLSTD' },
    justArrived: { code: 'JSTAR' },
    notAbleToAdminister: { code: 'NOABA' },
    maladministration: { code: 'ANLLQ' },
    pupilCheating: { code: 'ANLLH' }
  }
)
