'use strict'
import { IEstablishment } from './IEstablishment'
/* global describe, expect, beforeEach */

import sut from './school-predicates'

let school: IEstablishment

describe('school predicates', () => {
  beforeEach(() => {
    school = {
      URN: 1,
      EstablishmentStatus: {
        Code: 1
      },
      EstablishmentName: 'x',
      EstablishmentTypeGroup: {
        Code: 1
      },
      LA: {
        Code: 1
      },
      TypeOfEstablishment: {
        Code: 1
      }
    }
  })

  describe('#isSchoolOpen', () => {

    test('subject is defined', () => {
      expect(sut.isSchoolOpen).toBeDefined()
    })

    test('returns false when the school is closed', () => {
      school.EstablishmentStatus.Code = 2
      expect(sut.isSchoolOpen(school)).toBe(false)
    })

    test('logs when it returns false', () => {
      school.EstablishmentStatus.Code = 2
      expect(sut.isSchoolOpen(school)).toBe(false)
    })

    test('returns true when the school is open', () => {
      school.EstablishmentStatus.Code = 1
      expect(sut.isSchoolOpen(school)).toBe(true)
    })

    test('returns true when the school is open but proposed to close', () => {
      school.EstablishmentStatus.Code = 3
      expect(sut.isSchoolOpen(school)).toBe(true)
    })

    test('returns true when the school is proposed to open', () => {
      school.EstablishmentStatus.Code = 4
      expect(sut.isSchoolOpen(school)).toBe(true)
    })

    test('does not log when it returns true', () => {
      school.EstablishmentStatus.Code = 1
      expect(sut.isSchoolOpen(school)).toBe(true)
    })
  })

  describe('#isAgeInRange', () => {
    const targetAge = 9

    test('is defined', () => {
      expect(sut.isAgeInRange).toBeDefined()
    })

    test('returns false for schools that do not meet the low age range', () => {
      school.StatutoryLowAge = 10
      school.StatutoryHighAge = 18
      expect(sut.isAgeInRange(targetAge, school)).toBe(false)
    })

    test('logs when it returns false', () => {
      school.StatutoryLowAge = 10
      school.StatutoryHighAge = 18
      expect(sut.isAgeInRange(targetAge, school)).toBe(false)
    })

    test('returns false for schools that do not meet the high age range', () => {
      school.StatutoryLowAge = 3
      school.StatutoryHighAge = 8
      expect(sut.isAgeInRange(targetAge, school)).toBe(false)
    })

    test('returns true for schools that meet target age range', () => {
      school.StatutoryLowAge = 7
      school.StatutoryHighAge = 12
      expect(sut.isAgeInRange(targetAge, school)).toBe(true)
    })

    test('returns true for schools that only meet the target age range', () => {
      school.StatutoryLowAge = 9
      school.StatutoryHighAge = 9
      expect(sut.isAgeInRange(targetAge, school)).toBe(true)
    })

    test('excludes schools that don\'t provide low age information', () => {
      school.StatutoryLowAge = undefined
      school.StatutoryHighAge = 12
      expect(sut.isAgeInRange(targetAge, school)).toBe(false)
    })

    test('excludes schools that don\'t provide high age information', () => {
      school.StatutoryLowAge = 3
      school.StatutoryHighAge = undefined
      expect(sut.isAgeInRange(targetAge, school)).toBe(false)
    })
  })

  describe('#isRequiredEstablishmentTypeGroup', () => {

    test('is defined', () => {
      expect(sut.isRequiredEstablishmentTypeGroup).toBeDefined()
    })

    test('loads estabTypeGroupCode 4', () => {
      school.EstablishmentTypeGroup.Code = 4
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('does not load estabGroupCode 3', () => {
      school.EstablishmentTypeGroup.Code = 3
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(false)
    })

    test('loads estabTypeGroupCode 10', () => {
      school.EstablishmentTypeGroup.Code = 10
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('loads estabTypeGroupCode 11', () => {
      school.EstablishmentTypeGroup.Code = 11
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('loads estabTypeGroupCode 5 and TypeOfEstablishment = Community special school', () => {
      school.EstablishmentTypeGroup.Code = 5
      school.TypeOfEstablishment.Code = 7
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('loads estabTypeGroupCode 5 and TypeOfEstablishment = Foundation special school', () => {
      school.EstablishmentTypeGroup.Code = 5
      school.TypeOfEstablishment.Code = 12
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('loads estabTypeGroupCode 9 for estabTypeCode 26 only', () => {
      school.EstablishmentTypeGroup.Code = 9
      school.TypeOfEstablishment.Code = 26
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('does not loads estabTypeGroupCode 9 for estabTypeCode 25', () => {
      school.EstablishmentTypeGroup.Code = 9
      school.TypeOfEstablishment.Code = 25
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(false)
    })

    test('loads estabTypeGroupCode 9 for estabTypeCode 26 only with LA code of 704', () => {
      school.EstablishmentTypeGroup.Code = 9
      school.TypeOfEstablishment.Code = 26
      school.LA.Code = 704
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(false)
    })

    test('loads estabTypeGroupCode 9 for estabTypeCode 26 with LA code of 703', () => {
      school.EstablishmentTypeGroup.Code = 9
      school.TypeOfEstablishment.Code = 26
      school.LA.Code = 703
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })

    test('logs when it returns false', () => {
      school.EstablishmentTypeGroup.Code = 1
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(false)
    })

    test('does not log when it returns true', () => {
      school.EstablishmentTypeGroup.Code = 4
      expect(sut.isRequiredEstablishmentTypeGroup(school)).toBe(true)
    })
  })
})
