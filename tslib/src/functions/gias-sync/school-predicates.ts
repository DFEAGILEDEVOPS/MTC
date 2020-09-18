'use strict'

import { ILogger } from '../../common/logger'
import { IEstablishment } from './IEstablishment'
const RA = require('ramda-adjunct')

export default {
  isSchoolOpen (logger: ILogger, school: IEstablishment) {
    const schoolClosed = 2
    // we want to load all schools that are open, proposed to open, proposed to close
    // this is the same as every school that isn't closed
    if (Number(school.EstablishmentStatus.Code) === schoolClosed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      logger.info(`Excluding school ${school.URN} it is closed - estabStatusCode is [${school.EstablishmentStatus.Code}]`)
      return false
    }
    return true
  },

  isAgeInRange (logger: ILogger, targetAge: number, school: IEstablishment) {
    if (RA.isNilOrEmpty(school) || RA.isNilOrEmpty(school.StatutoryHighAge)) {
      logger.info(`Excluding school [${school.URN}] due to missing age fields: obj ${JSON.stringify(school)}`)
      return false
    }
    const low = Number(school.StatutoryLowAge)
    const high = Number(school.StatutoryHighAge)
    if (low <= targetAge && high >= targetAge) {
      return true
    }
    logger.info(`Excluding school ${school.URN} as it does not meet age criteria ${school.StatutoryLowAge}-${school.StatutoryHighAge}`)
    return false
  },

  isRequiredEstablishmentTypeGroup (logger: ILogger, school: IEstablishment) {
    const estabTypeGroupCodes = {
      academies: 10,
      freeSchools: 11,
      localAuthorityMaintainedSchools: 4,
      otherTypes: 9,
      specialSchools: 5
    }

    const estabTypeCodes = {
      communitySpecialSchool: 7,
      foundationSpecialSchool: 12,
      serviceChildrensEducation: 26
    }

    const schoolsInGibraltarLaCode = 704

    switch (school.EstablishmentTypeGroup.Code) {
      case estabTypeGroupCodes.localAuthorityMaintainedSchools:
      case estabTypeGroupCodes.academies:
      case estabTypeGroupCodes.freeSchools:
        return true
      case estabTypeGroupCodes.specialSchools:
        return school.TypeOfEstablishment.Code === estabTypeCodes.communitySpecialSchool ||
          school.TypeOfEstablishment.Code === estabTypeCodes.foundationSpecialSchool
      case estabTypeGroupCodes.otherTypes:
        return school.TypeOfEstablishment.Code === estabTypeCodes.serviceChildrensEducation &&
          school.LA.Code !== schoolsInGibraltarLaCode
      default:
        logger.info(`Excluding school ${school.URN} estab filter ${JSON.stringify(school)}`)
        return false
    }
  }
}
