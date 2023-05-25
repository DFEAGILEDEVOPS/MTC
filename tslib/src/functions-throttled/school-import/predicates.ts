import * as RA from 'ramda-adjunct'
import { type ISchoolRecord, EstabTypeCode, EstabTypeGroupCode, EstabStatusCode } from './data-access/ISchoolRecord'

const schoolsInGibraltarLaCode = 704

export interface ISchoolImportPredicates {
  isSchoolOpen (school: ISchoolRecord): SchoolPredicateResult
  isAgeInRange (targetAge: number, school: ISchoolRecord): SchoolPredicateResult
  isRequiredEstablishmentTypeGroup (school: ISchoolRecord): SchoolPredicateResult
  hasRequiredFields (school: ISchoolRecord): SchoolPredicateResult
}

export class SchoolPredicateResult {
  constructor (isMatch: boolean, message?: string) {
    this.isMatch = isMatch
    this.message = message ?? ''
  }

  isMatch: boolean
  message: string
}

export class Predicates implements ISchoolImportPredicates {
  hasRequiredFields (school: ISchoolRecord): SchoolPredicateResult {
    const issues: string[] = []
    if (!RA.isPositive(school.estabCode)) {
      issues.push('estabCode is required')
    }
    if (!RA.isPositive(school.leaCode)) {
      issues.push('leaCode is required')
    }
    if (RA.isNilOrEmpty(school.name)) {
      issues.push('name is required')
    }
    if (!RA.isPositive(school.urn)) {
      issues.push('urn is required')
    }
    if (issues.length > 0) {
      return new SchoolPredicateResult(false, `Excluding school ${school.urn}: ${issues.join('. ')}`)
    }
    return new SchoolPredicateResult(true)
  }

  isSchoolOpen (school: ISchoolRecord): SchoolPredicateResult {
    // we want to load all schools that are open and proposed to close
    // this is the same as every school that isn't closed and isn't Proposed to Open
    if (school.estabStatusCode === EstabStatusCode.Closed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 = proposed to open
      return new SchoolPredicateResult(false, `Excluding school ${school.urn} it is closed - estabStatusCode is [${school.estabStatusCode}]`)
    }
    if (school.estabStatusCode === EstabStatusCode.ProposedToOpen) {
      return new SchoolPredicateResult(false, `Excluding school ${school.urn} it is proposed to open - estabStatusCode is [${school.estabStatusCode}]`)
    }
    return new SchoolPredicateResult(true)
  }

  isAgeInRange (targetAge: number, school: ISchoolRecord): SchoolPredicateResult {
    if (RA.isNilOrEmpty(school.statLowAge) || RA.isNilOrEmpty(school.statHighAge)) {
      return new SchoolPredicateResult(false, `Excluding school [${school.urn}] due to missing age fields: obj ${JSON.stringify(school)}`)
    }
    const low = Number(school.statLowAge)
    const high = Number(school.statHighAge)
    if (low <= targetAge && high >= targetAge) {
      return new SchoolPredicateResult(true)
    }
    return new SchoolPredicateResult(false, `Excluding school ${school.urn} as it does not meet age criteria ${school.statLowAge}-${school.statHighAge}`)
  }

  isRequiredEstablishmentTypeGroup (school: ISchoolRecord): SchoolPredicateResult {
    switch (school.estabTypeGroupCode) {
      case EstabTypeGroupCode.localAuthorityMaintainedSchool:
      case EstabTypeGroupCode.academies:
      case EstabTypeGroupCode.freeSchool:
        return new SchoolPredicateResult(true)
      case EstabTypeGroupCode.specialSchool:
        // eslint-disable-next-line no-case-declarations
        const isCommunityOrFoundationSpecialOrNonMaintained = school.estabTypeCode === EstabTypeCode.communitySpecialSchool ||
          school.estabTypeCode === EstabTypeCode.foundationSpecialSchool || school.estabTypeCode === EstabTypeCode.nonMaintainedSpecialSchool
        if (isCommunityOrFoundationSpecialOrNonMaintained) {
          return new SchoolPredicateResult(true)
        } else {
          return new SchoolPredicateResult(false,
            `Excluding school ${school.urn} based on EstabTypeCode:${school.estabTypeCode} EstabTypeGroupCode:${school.estabTypeGroupCode}`)
        }
      case EstabTypeGroupCode.otherTypes:
        // eslint-disable-next-line no-case-declarations
        const isServiceChildrensEducationNotInGibraltar = school.estabTypeCode === EstabTypeCode.serviceChildrensEducation &&
        school.leaCode !== schoolsInGibraltarLaCode
        if (isServiceChildrensEducationNotInGibraltar) return new SchoolPredicateResult(true)
        return new SchoolPredicateResult(false,
          `Excluding school ${school.urn} based on EstabTypeCode:${school.estabTypeCode} LA:${school.leaCode}`)
      default:
        return new SchoolPredicateResult(false, `Excluding school ${school.urn} based on EstabTypeGroupCode ${JSON.stringify(school)}`)
    }
  }
}
