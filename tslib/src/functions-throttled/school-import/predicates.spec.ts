import { EstabTypeCode, EstabTypeGroupCode, type ISchoolRecord, EstabStatusCode } from './data-access/ISchoolRecord'
import { Predicates } from './predicates'

let sut: Predicates
let school: ISchoolRecord
const targetAge = 9
const schoolsInGibraltarLaCode = 704

describe('School Import Predicates', () => {
  beforeEach(() => {
    sut = new Predicates()
    school = {
      urn: 1,
      name: 'mock school',
      leaCode: 1,
      estabCode: 2,
      estabTypeGroupCode: EstabTypeGroupCode.independent,
      estabTypeCode: EstabTypeCode.communitySpecialSchool,
      estabStatusCode: EstabStatusCode.Open,
      statLowAge: targetAge - 1,
      statHighAge: targetAge + 1,
      estabTypeName: 'x'
    }
  })

  test('is defined', () => {
    expect(sut).toBeInstanceOf(Predicates)
  })

  describe('isSchoolOpen', () => {
    test('returns false when the school is closed', () => {
      school.estabStatusCode = EstabStatusCode.Closed
      const result = sut.isSchoolOpen(school)
      expect(result.isMatch).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
    })

    test('returns true when the school is open', () => {
      school.estabStatusCode = EstabStatusCode.Open
      const result = sut.isSchoolOpen(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('returns true when the school is open but proposed to close', () => {
      school.estabStatusCode = EstabStatusCode.ProposedToClose
      const result = sut.isSchoolOpen(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('returns false when the school is proposed to open', () => {
      school.estabStatusCode = EstabStatusCode.ProposedToOpen
      const result = sut.isSchoolOpen(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 1 it is proposed to open - estabStatusCode is [4]')
    })
  })

  describe('isAgeInRange', () => {
    test('returns false for schools that do not meet the low age range', () => {
      school.statLowAge = 10
      school.statHighAge = 18
      const result = sut.isAgeInRange(targetAge, school)
      expect(result.isMatch).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
    })

    test('returns false for schools that do not meet the high age range', () => {
      school.statLowAge = 3
      school.statHighAge = 8
      const result = sut.isAgeInRange(targetAge, school)
      expect(result.isMatch).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
    })

    test('returns true for schools that meet target age range', () => {
      school.statLowAge = 7
      school.statHighAge = 12
      const result = sut.isAgeInRange(targetAge, school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('returns true for schools that only meet the target age range', () => {
      school.statLowAge = 9
      school.statHighAge = 9
      const result = sut.isAgeInRange(targetAge, school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('excludes schools that don\'t provide low age information', () => {
      school.statLowAge = undefined
      school.statHighAge = 12
      const result = sut.isAgeInRange(targetAge, school)
      expect(result.isMatch).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
    })

    test('excludes schools that don\'t provide high age information', () => {
      school.statLowAge = 3
      school.statHighAge = undefined
      const result = sut.isAgeInRange(targetAge, school)
      expect(result.isMatch).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
    })
  })

  describe('#isRequiredEstablishmentTypeGroup', () => {
    test('loads estabTypeGroupCode 4', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.localAuthorityMaintainedSchool
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('does not load estabGroupCode 3', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.independent
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(false)
      expect(result.message.length).toBeGreaterThan(0)
    })

    test('loads estabTypeGroupCode 10', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.academies
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('loads estabTypeGroupCode 11', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.freeSchool
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('loads estabTypeGroupCode 5 and TypeOfEstablishment = Community special school', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.specialSchool
      school.estabTypeCode = EstabTypeCode.communitySpecialSchool
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('loads estabTypeGroupCode 5 and TypeOfEstablishment = Foundation special school', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.specialSchool
      school.estabTypeCode = EstabTypeCode.foundationSpecialSchool
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('loads estabTypeGroupCode 5 and TypeOfEstablishment = Non maintained special school', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.specialSchool
      school.estabTypeCode = EstabTypeCode.nonMaintainedSpecialSchool
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('loads estabTypeGroupCode 9 for estabTypeCode 26 only', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.serviceChildrensEducation
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })

    test('does not loads estabTypeGroupCode 9 for estabTypeCode 25', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.offshore
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(false)
    })

    test('loads estabTypeGroupCode 9 for estabTypeCode 26 only with LA code that matches schools in Gibraltar', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.serviceChildrensEducation
      school.leaCode = schoolsInGibraltarLaCode
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(false)
    })

    test('loads estabTypeGroupCode 9 for estabTypeCode 26 with LA code of 703', () => {
      school.estabTypeGroupCode = EstabTypeGroupCode.otherTypes
      school.estabTypeCode = EstabTypeCode.serviceChildrensEducation
      school.leaCode = 703
      const result = sut.isRequiredEstablishmentTypeGroup(school)
      expect(result.isMatch).toBe(true)
      expect(result.message).toBe('')
    })
  })

  describe('hasRequiredFields', () => {
    let school: ISchoolRecord
    beforeEach(() => {
      school = {
        estabCode: 1234,
        estabStatusCode: EstabStatusCode.Open,
        estabTypeCode: EstabTypeCode.communitySpecialSchool,
        estabTypeGroupCode: EstabTypeGroupCode.localAuthorityMaintainedSchool,
        leaCode: 743,
        name: 'school',
        urn: 12345,
        estabTypeName: 'x'
      }
    })
    test('returns false when estabCode is empty', () => {
      school.estabCode = undefined
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 12345: estabCode is required')
    })
    test('returns false when estabCode is zero', () => {
      school.estabCode = 0
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 12345: estabCode is required')
    })
    test('returns false when leaCode is empty', () => {
      school.leaCode = undefined
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 12345: leaCode is required')
    })
    test('returns false when leaCode is zero', () => {
      school.leaCode = 0
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 12345: leaCode is required')
    })
    test('returns false when name is undefined', () => {
      school.name = undefined
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 12345: name is required')
    })
    test('returns false when name is empty string', () => {
      school.name = ''
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 12345: name is required')
    })
    test('returns false when urn is undefined', () => {
      school.urn = undefined
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school undefined: urn is required')
    })
    test('returns false when urn is zero', () => {
      school.urn = 0
      const result = sut.hasRequiredFields(school)
      expect(result.isMatch).toBe(false)
      expect(result.message).toBe('Excluding school 0: urn is required')
    })
  })
})
