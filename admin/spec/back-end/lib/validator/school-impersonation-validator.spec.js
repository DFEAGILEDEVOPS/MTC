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
  it('should trim leading spaces from dfeNumber, if detected', function () {
    const result = sut.isDfeNumberValid(' 1234567')
    expect(result.hasError()).toBeFalsy()
  })
  it('should trim trailing spaces from dfeNumber, if detected', function () {
    const result = sut.isDfeNumberValid('1234567 ')
    expect(result.hasError()).toBeFalsy()
  })
  it('should detect and remove hyphen at index 3, if detected', function () {
    const result = sut.isDfeNumberValid('123-4567')
    expect(result.hasError()).toBeFalsy()
  })
  it('should detect and remove forward slash at index 3, if detected', function () {
    const result = sut.isDfeNumberValid('123/4567')
    expect(result.hasError()).toBeFalsy()
  })
  it('should not detect or remove other special characters at index 3', function () {
    let result = sut.isDfeNumberValid('123*4567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('123@4567')
    expect(result.hasError()).toBeTruthy()
    result = sut.isDfeNumberValid('123+4567')
    expect(result.hasError()).toBeTruthy()
  })
  it('should not detect or remove any special characters in other positions', function () {
    let result = sut.isDfeNumberValid('12/34567')
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
  it('should add a validation error if dfeNumber is undefined', function () {
    const result = sut.isDfeNumberValid(undefined)
    expect(result.hasError()).toBeTruthy()
  })
  it('should add a validation error if dfeNumber is null', function () {
    const result = sut.isDfeNumberValid(null)
    expect(result.hasError()).toBeTruthy()
  })
  it('should add a validation error if dfeNumber is empty', function () {
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
