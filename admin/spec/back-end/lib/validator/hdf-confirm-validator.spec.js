'use strict'

/* global beforeEach, describe, it, expect */

const hdfConfirmValidator = require('../../../../lib/validator/hdf-confirm-validator')

describe('HDF confirm validator', function () {
  let requestData

  beforeEach(() => {
    requestData = {
      confirm: 'Y',
      pupilDetails: 'checked',
      uniquePins: 'checked',
      staffConfirm: 'checked'
    }
  })

  describe('validate', function () {
    it('returns validationError object with no errors if the validation is successful', () => {
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })

    it('requires pupilDetails to be checked', () => {
      requestData.pupilDetails = ''
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('confirmBoxes')).toBe(true)
    })

    it('requires uniquePins to be checked', () => {
      requestData.uniquePins = ''
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('confirmBoxes')).toBe(true)
    })

    it('requires staffConfirm to be checked', () => {
      requestData.staffConfirm = ''
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('confirmBoxes')).toBe(true)
    })

    describe('when not confirmed', () => {
      beforeEach(() => {
        requestData.confirm = 'N'
        requestData.pupilDetails = ''
        requestData.uniquePins = ''
        requestData.staffConfirm = ''
      })

      it('returns validationError object with no errors if the validation is successful', () => {
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBeFalsy()
      })
    })
  })
})
