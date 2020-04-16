'use strict'

/* global describe, it expect */
const sut = require('../../../../lib/validator/school-impersonation-validator')

describe('schoolImpersonationDfeNumberValidator.isDfeNumberValid', function () {
  it('should validate a 7 digit number', function () {
    const result = sut.isDfeNumberValid(1234500)
    expect(result.hasError()).toBeFalsy()
  })
  it('should fail a 6 digit number', function () {
    const result = sut.isDfeNumberValid(123450)
    expect(result.hasError()).toBeTruthy()
  })
  it('should fail an 8 digit number', function () {
    const result = sut.isDfeNumberValid(12345670)
    expect(result.hasError()).toBeTruthy()
  })
  it('should validate 7 char numeric string', function () {
    const result = sut.isDfeNumberValid('1234567')
    expect(result.hasError()).toBeFalsy()
  })
  it('should not validate 6 char numeric string', function () {
    const result = sut.isDfeNumberValid('123456')
    expect(result.hasError()).toBeTruthy()
  })
  it('should not validate 8 char numeric string', function () {
    const result = sut.isDfeNumberValid('12345678')
    expect(result.hasError()).toBeTruthy()
  })
  it('should not validate special characters', function () {
    let result = sut.isDfeNumberValid('123*4567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('123@4567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('123+4567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('12/34567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('12-34567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('12*34567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('1234-567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('1234/567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('1234 567')
    expect(result.hasError()).toBeTruthy()
  })
  it('should not validate undefined', function () {
    const result = sut.isDfeNumberValid(undefined)
    expect(result.hasError()).toBeTruthy()
  })
  it('should not validate null', function () {
    const result = sut.isDfeNumberValid(null)
    expect(result.hasError()).toBeTruthy()
  })
  it('should not validate empty string', function () {
    const result = sut.isDfeNumberValid('')
    expect(result.hasError()).toBeTruthy()
  })
})

describe('schoolImpersonationDfeNumberValidator.isSchoolRecordValid', function () {
  it('should not add a validation error if school object is valid', function () {
    const school = { id: 1 }
    const result = sut.isSchoolRecordValid(school)
    expect(result.hasError()).toBeFalsy()
  })
  it('should add a validation error if school object is undefined', function () {
    const school = undefined
    const result = sut.isSchoolRecordValid(school)
    expect(result.hasError()).toBeTruthy()
  })
  it('should add a validation error if school object is not valid', function () {
    const school = {}
    const result = sut.isSchoolRecordValid(school)
    expect(result.hasError()).toBeTruthy()
  })
  it('should add a validation error if school object is not valid', function () {
    const school = { id: undefined }
    const result = sut.isSchoolRecordValid(school)
    expect(result.hasError()).toBeTruthy()
  })
})
