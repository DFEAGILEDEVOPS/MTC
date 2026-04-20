'use strict'

const hdfConfirmValidator = require('../../../../lib/validator/hdf-confirm-validator')
const hdfConfirmOptions = require('../../../../lib/consts/hdf-confirm-options')

describe('HDF confirm validator', function () {
  let requestData

  beforeEach(() => {
    requestData = {
      confirm: hdfConfirmOptions.confirmAll,
      noPupilsFurtherInfo: undefined
    }
  })

  describe('validate', function () {
    test('returns validationError object with no errors if the validation is successful', () => {
      const validationError = hdfConfirmValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })

    describe('when not confirmed', () => {
      beforeEach(() => {
        requestData.confirm = hdfConfirmOptions.confirmNo
        requestData.noPupilsFurtherInfo = ''
      })

      test('returns validationError object with no errors if the validation is successful', () => {
        requestData.noPupilsFurtherInfo = 'the info'
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBe(false)
      })

      test('returns validationError object with error if info is empty string', () => {
        requestData.noPupilsFurtherInfo = ''
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBe(true)
      })

      test('returns validationError object with error if info is undefined', () => {
        requestData.noPupilsFurtherInfo = undefined
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBe(true)
      })

      test('returns validationError object with error if info is too long', () => {
        requestData.noPupilsFurtherInfo = 'x'.repeat(1001)
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBe(true)
      })
    })

    describe('when no pupils taking check', () => {
      beforeEach(() => {
        requestData.confirm = hdfConfirmOptions.confirmNone
        requestData.noPupilsFurtherInfo = ''
      })

      test('returns validationError object with no errors', () => {
        const validationError = hdfConfirmValidator.validate(requestData)
        expect(validationError.hasError()).toBe(false)
      })
    })
  })
})
