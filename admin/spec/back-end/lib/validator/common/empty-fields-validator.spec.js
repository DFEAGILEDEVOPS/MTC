'use strict'

const emptyFieldsValidator = require('../../../../../lib/validator/common/empty-fields-validators')

describe('emptyFieldValidator', function () {
  describe('validate', function () {
    test('returns a validationError object with errors if the value is an empty string', () => {
      const fields = [{
        fieldKey: 'fieldKey',
        fieldValue: '',
        errorMessage: 'errorMessage'
      }]
      const validationError = emptyFieldsValidator.validate(fields)
      expect(validationError.hasError()).toBeTruthy()
    })
    test('returns a validationError object with errors if the value is a spaced string', () => {
      const fields = [{
        fieldKey: 'fieldKey',
        fieldValue: ' ',
        errorMessage: 'errorMessage'
      }]
      const validationError = emptyFieldsValidator.validate(fields)
      expect(validationError.hasError()).toBeTruthy()
    })
    test('returns a validationError object with errors if the value is undefined', () => {
      const fields = [{
        fieldKey: 'fieldKey',
        fieldValue: undefined,
        errorMessage: 'errorMessage'
      }]
      const validationError = emptyFieldsValidator.validate(fields)
      expect(validationError.hasError()).toBeTruthy()
    })
    test('returns a validationError object with errors if the value is null', () => {
      const fields = [{
        fieldKey: 'fieldKey',
        fieldValue: null,
        errorMessage: 'errorMessage'
      }]
      const validationError = emptyFieldsValidator.validate(fields)
      expect(validationError.hasError()).toBeTruthy()
    })
    test('returns a validationError object with no errors if the value contains special characters', () => {
      const fields = [{
        fieldKey: 'fieldKey',
        fieldValue: '@fieldValue',
        errorMessage: 'errorMessage'
      }]
      const validationError = emptyFieldsValidator.validate(fields)
      expect(validationError.hasError()).toBeFalsy()
    })
    test('returns a validationError object with no errors if the value contains no special characters', () => {
      const fields = [{
        fieldKey: 'fieldKey',
        fieldValue: 'fieldValue',
        errorMessage: 'errorMessage'
      }]
      const validationError = emptyFieldsValidator.validate(fields)
      expect(validationError.hasError()).toBeFalsy()
    })
  })
})
