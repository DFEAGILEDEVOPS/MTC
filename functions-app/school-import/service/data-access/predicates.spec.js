'use strict'
/* global describe, expect, it, jasmine, beforeEach */

const sut = require('./predicates')

let mockLogger

describe('#isSchoolOpen', () => {
  beforeEach(() => {
    mockLogger = jasmine.createSpy('mockLogger')
  })

  it('is defined', () => {
    expect(sut.isSchoolOpen).toBeDefined()
  })

  it('returns false when the school is closed', () => {
    const school = { urn: '1', estabStatusCode: '2' }
    expect(sut.isSchoolOpen(mockLogger, school)).toBe(false)
  })

  it('logs when it returns false', () => {
    const school = { urn: '2', estabStatusCode: '2' }
    expect(sut.isSchoolOpen(mockLogger, school)).toBe(false)
    expect(mockLogger).toHaveBeenCalledTimes(1)
  })

  it('returns true when the school is open', () => {
    const school = { estabStatusCode: '1' }
    expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
  })

  it('returns true when the school is open but proposed to close', () => {
    const school = { estabStatusCode: '3' }
    expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
  })

  it('returns true when the school is proposed to open', () => {
    const school = { estabStatusCode: '4' }
    expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
  })

  it('does not log when it returns true', () => {
    const school = { estabStatusCode: '1' }
    expect(sut.isSchoolOpen(mockLogger, school)).toBe(true)
    expect(mockLogger).not.toHaveBeenCalled()
  })
})

describe('#isAgeInRange', () => {
  const targetAge = 9

  beforeEach(() => {
    mockLogger = jasmine.createSpy('mockLogger')
  })

  it('is defined', () => {
    expect(sut.isAgeInRange).toBeDefined()
  })

  it('returns false for schools that do not meet the low age range', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '10',
      statHighAge: '18'
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
  })

  it('logs when it returns false', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '10',
      statHighAge: '18'
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
    expect(mockLogger).toHaveBeenCalledTimes(1)
  })

  it('returns false for schools that do not meet the high age range', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '3',
      statHighAge: '8'
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
  })

  it('returns true for schools that meet target age range', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '7',
      statHighAge: '12'
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(true)
    expect(mockLogger).not.toHaveBeenCalled()
  })

  it('returns true for schools that only meet the target age range', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '9',
      statHighAge: '9'
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(true)
    expect(mockLogger).not.toHaveBeenCalled()
  })

  it('excludes schools that don\'t provide low age information', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '',
      statHighAge: '12'
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
  })

  it('excludes schools that don\'t provide high age information', () => {
    const school = {
      urn: '1',
      estabStatusCode: '1', // open
      statLowAge: '3',
      statHighAge: ''
    }
    expect(sut.isAgeInRange(mockLogger, targetAge, school)).toBe(false)
  })
})

describe('#isRequiredEstablishmentTypeGroup', () => {
  beforeEach(() => {
    mockLogger = jasmine.createSpy('mockLogger')
  })

  it('is defined', () => {
    expect(sut.isRequiredEstablishmentTypeGroup).toBeDefined()
  })

  it('loads estabTypeGroupCode 4', () => {
    const school = {
      estabTypeGroupCode: '4'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('does not load estabGroupCode 3', () => {
    const school = {
      estabTypeGroupCode: '3'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
  })

  it('loads estabTypeGroupCode 10', () => {
    const school = {
      estabTypeGroupCode: '10'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('loads estabTypeGroupCode 11', () => {
    const school = {
      estabTypeGroupCode: '11'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('loads estabTypeGroupCode 5 and TypeOfEstablishment = Community special school', () => {
    const school = {
      estabTypeGroupCode: '5',
      estabTypeCode: '7' // Community special school
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('loads estabTypeGroupCode 5 and TypeOfEstablishment = Foundation special school', () => {
    const school = {
      estabTypeGroupCode: '5',
      estabTypeCode: '12' // Foundation special school
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('loads estabTypeGroupCode 9 for estabTypeCode 26 only', () => {
    const school = {
      estabTypeGroupCode: '9',
      estabTypeCode: '26'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('does not loads estabTypeGroupCode 9 for estabTypeCode 25', () => {
    const school = {
      estabTypeGroupCode: '9',
      estabTypeCode: '25'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
  })

  it('loads estabTypeGroupCode 9 for estabTypeCode 26 only with LA code of 704', () => {
    const school = {
      estabTypeGroupCode: '9',
      estabTypeCode: '26',
      leaCode: '704'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
  })

  it('loads estabTypeGroupCode 9 for estabTypeCode 26 with LA code of 703', () => {
    const school = {
      estabTypeGroupCode: '9',
      estabTypeCode: '26',
      leaCode: '703'
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
  })

  it('logs when it returns false', () => {
    const school = {
      estabTypeGroupCode: '1',
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(false)
    expect(mockLogger).toHaveBeenCalled()
  })

  it('does not log when it returns true', () => {
    const school = {
      estabTypeGroupCode: '4',
    }
    expect(sut.isRequiredEstablishmentTypeGroup(mockLogger, school)).toBe(true)
    expect(mockLogger).not.toHaveBeenCalled()
  })

})
