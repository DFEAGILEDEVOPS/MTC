'use strict'

import { IEstablishment } from './IEstablishment'
const RA = require('ramda-adjunct')

export default {
  isSchoolOpen (school: IEstablishment) {
    const schoolClosed = 2
    // we want to load all schools that are open, proposed to open, proposed to close
    // this is the same as every school that isn't closed
    if (Number(school.EstablishmentStatus.Code) === schoolClosed) {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      return false
    }
    return true
  },

  isAgeInRange (targetAge: number, school: IEstablishment) {
    if (RA.isNilOrEmpty(school) || RA.isNilOrEmpty(school.StatutoryHighAge)) {
      return false
    }
    const low = Number(school.StatutoryLowAge)
    const high = Number(school.StatutoryHighAge)
    if (low <= targetAge && high >= targetAge) {
      return true
    }
    return false
  },

  isRequiredEstablishmentTypeGroup (school: IEstablishment) {
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
        return false
    }
  }
}
