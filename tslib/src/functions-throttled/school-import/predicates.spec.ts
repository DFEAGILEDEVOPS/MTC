
import { EstabTypeCode, EstabTypeGroupCode, ISchoolRecord } from './data-access/ISchoolRecord'
/* global describe, expect, it, jasmine, beforeEach */

import { Predicates } from './predicates'

let mockLogger: any
let sut: Predicates
let school: ISchoolRecord
const targetAge = 9

describe('School Import Predicates', () => {
  beforeEach(() => {
    sut = new Predicates()
    mockLogger = jasmine.createSpy('mockLogger')
    school = {
      urn: 1,
      name: 'mock school',
      leaCode: 1,
      estabCode: 2,
      estabTypeGroupCode: 3,
      estabTypeCode: 4,
      estabStatusCode: 1,
      statLowAge: 7,
      statHighAge: 12
    }
  })

  it('is defined', () => {
    expect(sut).toBeInstanceOf(Predicates)
  })

  describe('isSchoolOpen', () => {
    it('returns false when the school is closed', () => {
      school.estabStatusCode = 2
      expect(sut.isSchoolOpen(mockLogger, school)).toBe(false)
    })

    it('logs when it returns false', () => {
      school.estabStatusCode = 2
      expect(sut.isSchoolOpen(mockLogger, school)).toBe(false)
      expect(mockLogger).toHaveBeenCalledTimes(1)
    })

    it('returns true when the school is open', () => {
      school.estabStatusCode = 1
      expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
    })

    it('returns true when the school is open but proposed to close', () => {
      school.estabStatusCode = 3
      expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
    })

    it('returns true when the school is proposed to open', () => {
      school.estabStatusCode = 4
      expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
    })

    it('does not log when it returns true', () => {
      school.estabStatusCode = 1
      expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
      expect(mockLogger).not.toHaveBeenCalled()
    })
  })

  describe('isAgeInRange', () => {
    it('returns false for schools that do not meet the low age range', () => {
      school.statLowAge = 10
      school.statHighAge = 18
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
    })

    it('logs when it returns false', () => {
      school.statLowAge = 10
      school.statHighAge = 18
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
      expect(mockLogger).toHaveBeenCalledTimes(1)
    })

    it('returns false for schools that do not meet the high age range', () => {
      school.statLowAge = 3
      school.statHighAge = 8
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
    })

    it('returns true for schools that meet target age range', () => {
      school.statLowAge = 7
      school.statHighAge = 12
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(true)
      expect(mockLogger).not.toHaveBeenCalled()
    })

    it('returns true for schools that only meet the target age range', () => {
      school.statLowAge = 9
      school.statHighAge = 9
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(true)
      expect(mockLogger).not.toHaveBeenCalled()
    })

    it('excludes schools that don\'t provide low age information', () => {
      school.statLowAge = undefined
      school.statHighAge = 12
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
    })

    it('excludes schools that don\'t provide high age information', () => {
      school.statLowAge = 3
      school.statHighAge = undefined
      expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
    })
  })

  describe('#isRequiredEstablishmentTypeGroup', () => {
    it('loads estabTypeGroupCode 4', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.localAuthorityMaintainedSchool
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('does not load estabGroupCode 3', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.independent
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
    })

    it('loads estabTypeGroupCode 10', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.academies
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('loads estabTypeGroupCode 11', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.freeSchool
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('loads estabTypeGroupCode 5 and TypeOfEstablishment = Community special school', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.specialSchool
      school.estabTypeCode = EstabTypeCode.communitySpecialSchool
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('loads estabTypeGroupCode 5 and TypeOfEstablishment = Foundation special school', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.specialSchool
      school.estabTypeCode = EstabTypeCode.foundationSpecialSchool
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('loads estabTypeGroupCode 9 for estabTypeCode 26 only', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.serviceChildrensEducation
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('does not loads estabTypeGroupCode 9 for estabTypeCode 25', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.offshore
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
    })

    it('loads estabTypeGroupCode 9 for estabTypeCode 26 only with LA code of 704', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.serviceChildrensEducation
      school.leaCode = 704
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
    })

    it('loads estabTypeGroupCode 9 for estabTypeCode 26 with LA code of 703', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.serviceChildrensEducation
      school.leaCode = 703
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    })

    it('logs when it returns false', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.college
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
      expect(mockLogger).toHaveBeenCalled()
    })

    it('does not log when it returns true', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.localAuthorityMaintainedSchool
      expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
      expect(mockLogger).not.toHaveBeenCalled()
    })
  })
})
