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

describe('#isNotBritishOverseas', () => {
  beforeEach(() => {
    mockLogger = jasmine.createSpy('mockLogger')
  })

  it('returns false when the school is british overseas school', () => {
    const school = {
      estabTypeCode: '37'
    }
    expect(sut.isNotBritishOverseas(mockLogger, school)).toBe(false)
  })

  it('logs when it returns false', () => {
    const school = {
      estabTypeCode: '37'
    }
    expect(sut.isNotBritishOverseas(mockLogger, school)).toBe(false)
    expect(mockLogger).toHaveBeenCalledTimes(1)
  })

  it('returns true when the school is not an overseas school', () => {
    const school = {
      estabTypeCode: '1'
    }
    expect(sut.isNotBritishOverseas(mockLogger, school)).toBe(true)
  })
})
