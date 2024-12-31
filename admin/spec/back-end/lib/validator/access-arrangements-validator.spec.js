'use strict'

const accessArrangementsValidator = require('../../../../lib/validator/access-arrangements-validator')

describe('Access arrangements validator', function () {
  describe('validate', function () {
    test('returns validationError object with no errors if the validation is successful', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        nextButtonInforamtion: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
    test('requires a pupil UrlSlug', () => {
      const requestData = {
        accessArrangements: ['ATA'],
        nextButtonInforamtion: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('pupil-autocomplete-container')).toBeTruthy()
    })
    test('requires an access arrangement selection', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        nextButtonInforamtion: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('accessArrangementsList')).toBeTruthy()
    })
    test('ignores pupilUrlSlug value when isEditView is true ', () => {
      const requestData = {
        isEditView: 'true',
        accessArrangements: ['ATA'],
        nextButtonInforamtion: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
    test('ignores accessArrangementsCodes array when isEditView is true ', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        isEditView: 'true',
        nextButtonInforamtion: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
  })
})
