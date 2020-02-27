'use strict'
const RA = require('ramda-adjunct')

const predicates = {
  isSchoolOpen (logger, school) {
    const schoolClosed = 2
    // we want to load all schools that are open, proposed to open, proposed to close
    // this is the same as every school that isn't closed
    if (Number(school.estabStatusCode) === schoolClosed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      logger(`Excluding school ${school.urn} it is closed - estabStatusCode is [${school.estabStatusCode}]`)
      return false
    }
    return true
  },

  isAgeInRange (logger, targetAge, school) {
    if (RA.isNilOrEmpty(school.statLowAge) || RA.isNilOrEmpty(school.statHighAge)) {
      logger(`Excluding school [${school.urn}] due to missing age fields: obj ${JSON.stringify(school)}`)
      return false
    }
    const low = Number(school.statLowAge)
    const high = Number(school.statHighAge)
    if (low <= targetAge && high >= targetAge) {
      return true
    }
    logger(`Excluding school ${school.urn} as it does not meet age criteria ${school.statLowAge}-${school.statHighAge}`)
    return false
  },

  isNotBritishOverseas (logger, school) {
    const britishOverseasEstabType = 37
    if (Number(school.estabTypeCode) === britishOverseasEstabType) {
      logger(`Excluding school ${school.urn} as it is a British overseas school`)
      return false
    }
    return true
  }
}

module.exports = predicates
