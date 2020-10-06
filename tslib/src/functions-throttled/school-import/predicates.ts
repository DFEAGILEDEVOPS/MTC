import * as RA from 'ramda-adjunct'
import { ISchoolRecord } from './data-access/ISchoolRecord'
export type LogFunc = (msg: string) => void

export interface ISchoolImportPredicates {
  isSchoolOpen (logger: LogFunc, school: any): boolean
  isAgeInRange (logger: LogFunc, targetAge: number, school: any): boolean
  isRequiredEstablishmentTypeGroup (logger: LogFunc, school: any): boolean
  matchesAll (logger: LogFunc, school: ISchoolRecord): boolean
}

export class Predicates implements ISchoolImportPredicates {
  isSchoolOpen (logger: LogFunc, school: any): boolean {
    const schoolClosed = 2
    // we want to load all schools that are open, proposed to open, proposed to close
    // this is the same as every school that isn't closed
    if (Number(school.estabStatusCode) === schoolClosed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      logger(`Excluding school ${school.urn} it is closed - estabStatusCode is [${school.estabStatusCode}]`)
      return false
    }
    return true
  }

  isAgeInRange (logger: LogFunc, targetAge: number, school: any): boolean {
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
  }

  isRequiredEstablishmentTypeGroup (logger: LogFunc, school: any): boolean {
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
        logger(`Excluding school ${school.urn} estab filter ${JSON.stringify(school)}`)
        return false
    }
  }

  matchesAll (logger: LogFunc, school: any): boolean {
    const targetAge = 9
    return this.isSchoolOpen(logger, school) &&
      this.isRequiredEstablishmentTypeGroup(logger, school) &&
      this.isAgeInRange(logger, targetAge, school)
  }
}
