'use strict'

/* global beforeEach, describe, test, expect */

const hdfConfirmValidator = require('../../../../lib/validator/hdf-confirm-validator')

describe('HDF confirm validator', function () {
  let requestData

  beforeEach(() => {
    requestData = {
      confirm: 'Y',
      pupilDetails: 'checked',
      uniquePins: 'checked',
      staffConfirm: 'checked',
      disruptionConfirm: 'checked'
    }
  })

  describe('validate', function () {
    test('returns validationError object with no errors if the validation is successful', () => {
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })

    test('requires pupilDetails to be checked', () => {
      requestData.pupilDetails = ''
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('confirmBoxes')).toBe(true)
    })

    test('requires uniquePins to be checked', () => {
      requestData.uniquePins = ''
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('confirmBoxes')).toBe(true)
    })

    test('requires staffConfirm to be checked', () => {
      requestData.staffConfirm = ''
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('confirmBoxes')).toBe(true)
    })

    test('requires disruptionConfirm to be checked', () => {
      requestData.disruptionConfirm = ''
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
        requestData.disruptionConfirm = ''
      })

      test('returns validationError object with no errors if the validation is successful', () => {
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBeFalsy()
      })
    })
  })
})
