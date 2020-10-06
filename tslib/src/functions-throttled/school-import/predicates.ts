import * as RA from 'ramda-adjunct'
import { ISchoolRecord, EstabTypeCode, EstabTypeGroupCode, EstabStatusCode } from './data-access/ISchoolRecord'
export type LogFunc = (msg: string) => void

export interface ISchoolImportPredicates {
  isSchoolOpen (logger: LogFunc, school: ISchoolRecord): boolean
  isAgeInRange (logger: LogFunc, targetAge: number, school: ISchoolRecord): boolean
  isRequiredEstablishmentTypeGroup (logger: LogFunc, school: ISchoolRecord): boolean
  matchesAll (logger: LogFunc, school: ISchoolRecord): boolean
}

export class Predicates implements ISchoolImportPredicates {
  isSchoolOpen (logger: LogFunc, school: ISchoolRecord): boolean {
    // we want to load all schools that are open, proposed to open, proposed to close
    // this is the same as every school that isn't closed
    if (school.estabStatusCode === EstabStatusCode.Closed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      logger(`Excluding school ${school.urn} it is closed - estabStatusCode is [${school.estabStatusCode}]`)
      return false
    }
    return true
  }

  isAgeInRange (logger: LogFunc, targetAge: number, school: ISchoolRecord): boolean {
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

  isRequiredEstablishmentTypeGroup (logger: LogFunc, school: ISchoolRecord): boolean {

    switch (school.estabTypeGroupCode) {
      case EstabTypeGroupCode.localAuthorityMaintainedSchool:
      case EstabTypeGroupCode.academies:
      case EstabTypeGroupCode.freeSchool:
        return true
      case EstabTypeGroupCode.specialSchool:
        return school.estabTypeCode === EstabTypeCode.communitySpecialSchool ||
          school.estabTypeCode === EstabTypeCode.foundationSpecialSchool
      case EstabTypeGroupCode.otherTypes:
        return school.estabTypeCode === EstabTypeCode.serviceChildrensEducation &&
          school.leaCode !== 704
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
