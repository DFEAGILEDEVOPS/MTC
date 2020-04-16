'use strict'

/* global describe, it expect xdescribe */
const schoolImpersonationValidator = require('../../../../lib/validator/school-impersonation-validator')
const sut = require('../../../../lib/validator/school-impersonation-validator')

describe('schoolImpersonationDfeNumberValidator', function () {
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
  })
})

xdescribe('schoolImpersonationDfeNumberValidator', function () {
  describe('isDfeNumberEmpty', function () {
    it('should not add a validation error if dfeNumber is a string value', function () {
      const dfeNumber = '1230000'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if dfeNumber is a numeric value', function () {
      const dfeNumber = 1230000
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is empty', function () {
      const dfeNumber = undefined
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should not add a validation error if dfeNumber is a string that contains only a number', function () {
      const dfeNumber = '1230000'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if dfeNumber is a string that contains two numbers and a space in-between', function () {
      const dfeNumber = '123 0000'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is a string that contains one number and one character and a space in-between', function () {
      const dfeNumber = '1 d'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is a string that contains a number and one special character', function () {
      const dfeNumber = '1*'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is a string that contains a special character and a number', function () {
      const dfeNumber = '.9991001'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is an empty string', function () {
      const dfeNumber = ''
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is undefined', function () {
      const dfeNumber = undefined
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is null', function () {
      const dfeNumber = null
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should trim leading spaces before regex match', function () {
      const dfeNumber = ' 9991001'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should trim trailing spaces before regex match', function () {
      const dfeNumber = '9991001 '
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should trim hyphen at index 3 before regex match', function () {
      const dfeNumber = '999-1001 '
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should trim forward slash at index 3 before regex match', function () {
      const dfeNumber = '999/1001 '
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should not trim other special characters at index 3 before regex match', function () {
      const dfeNumber = '999*1001 '
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
  })
  describe('isSchoolRecordValid', function () {
    it('should not add a validation error if school object is valid', function () {
      const school = { id: 1 }
      const result = schoolImpersonationValidator.isSchoolRecordValid(school)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if school object is not valid', function () {
      const school = undefined
      const result = schoolImpersonationValidator.isSchoolRecordValid(school)
      expect(result.hasError()).toBeTruthy()
    })
  })
})
