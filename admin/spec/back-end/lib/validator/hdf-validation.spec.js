'use strict'

/* global beforeEach, describe, it, expect */

const hdfValidator = require('../../../../lib/validator/hdf-validator')

describe('HDF validator', function () {
  let requestData

  beforeEach(() => {
    requestData = {
      firstName: 'a',
      lastName: 'b',
      isHeadteacher: 'Y',
      jobTitle: 'c'
    }
  })

  describe('validate', function () {
    it('returns validationError object with no errors if the validation is successful', () => {
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })

    it('requires firstName to be non-empty', () => {
      requestData.firstName = ''
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('firstName')).toBe(true)
    })

    it('requires firstName to be up to 128 chars long', () => {
      requestData.firstName = 's'.repeat(129)
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('firstName')).toBe(true)
    })

    it('allows latin chars, hyphen and apostrophe in firstName', () => {
      requestData.firstName = 'Rén-\'e'
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })

    it('requires lastName to be non-empty', () => {
      requestData.lastName = ''
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('lastName')).toBe(true)
    })

    it('requires lastName to be up to 128 chars long', () => {
      requestData.lastName = 's'.repeat(129)
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('lastName')).toBe(true)
    })

    it('allows latin chars, hyphen and apostrophe in lastName', () => {
      requestData.lastName = 'Rén-\'e'
      const validationError = hdfValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })

    describe('when not a headteacher', () => {
      beforeEach(() => {
        requestData.isHeadteacher = 'N'
      })

      it('requires jobTitle to be non-empty', () => {
        requestData.jobTitle = ''
        const validationError = hdfValidator.validate(requestData)
        expect(validationError.hasError()).toBeTruthy()
        expect(validationError.isError('jobTitle')).toBe(true)
      })

      it('requires jobTitle to be up to 128 chars long', () => {
        requestData.jobTitle = 's'.repeat(129)
        const validationError = hdfValidator.validate(requestData)
        expect(validationError.hasError()).toBeTruthy()
        expect(validationError.isError('jobTitle')).toBe(true)
      })
    })

    describe('when a headteacher', () => {
      it('ignores jobTitle', () => {
        requestData.jobTitle = ''
        const validationError = hdfValidator.validate(requestData)
        expect(validationError.hasError()).toBeFalsy()
      })
    })
  })
})
