import RA from 'ramda-adjunct'
import { ILogger } from '../../../common/logger'

export class Predicates {
  isSchoolOpen (logger: ILogger, school: any) {
    const schoolClosed = 2
    // we want to load all schools that are open, proposed to open, proposed to close
    // this is the same as every school that isn't closed
    if (Number(school.estabStatusCode) === schoolClosed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      logger.info(`Excluding school ${school.urn} it is closed - estabStatusCode is [${school.estabStatusCode}]`)
      return false
    }
    return true
  }

  isAgeInRange (logger: ILogger, targetAge: number, school: any) {
    if (RA.isNilOrEmpty(school.statLowAge) || RA.isNilOrEmpty(school.statHighAge)) {
      logger.info(`Excluding school [${school.urn}] due to missing age fields: obj ${JSON.stringify(school)}`)
      return false
    }
    const low = Number(school.statLowAge)
    const high = Number(school.statHighAge)
    if (low <= targetAge && high >= targetAge) {
      return true
    }
    logger.info(`Excluding school ${school.urn} as it does not meet age criteria ${school.statLowAge}-${school.statHighAge}`)
    return false
  }

  isRequiredEstablishmentTypeGroup (logger: ILogger, school: any) {
    const estabTypeGroupCodes = {
      academies: '10',
      freeSchools: '11',
      localAuthorityMaintainedSchools: '4',
      otherTypes: '9',
      specialSchools: '5'
    }

    const estabTypeCodes = {
      communitySpecialSchool: '7',
      foundationSpecialSchool: '12',
      serviceChildrensEducation: '26'
    }

    switch (school.estabTypeGroupCode) {
      case estabTypeGroupCodes.localAuthorityMaintainedSchools:
      case estabTypeGroupCodes.academies:
      case estabTypeGroupCodes.freeSchools:
        return true
      case estabTypeGroupCodes.specialSchools:
        return school.estabTypeCode === estabTypeCodes.communitySpecialSchool ||
          school.estabTypeCode === estabTypeCodes.foundationSpecialSchool
      case estabTypeGroupCodes.otherTypes:
        return school.estabTypeCode === estabTypeCodes.serviceChildrensEducation &&
          school.leaCode !== '704'
      default:
        logger.info(`Excluding school ${school.urn} estab filter ${JSON.stringify(school)}`)
        return false
    }
  }
}
