'use strict'

/* global describe, test expect */
const accessArrangementsValidator = require('../../../../lib/validator/access-arrangements-validator')

describe('Access arrangements validator', function () {
  describe('validate', function () {
    test('returns validationError object with no errors if the validation is successful', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: 'VIM',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
    test('requires a pupil UrlSlug', () => {
      const requestData = {
        accessArrangements: ['ATA'],
        questionReaderReason: 'VIM',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('pupil-autocomplete-container')).toBeTruthy()
    })
    test('requires an access arrangement selection', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        questionReaderReason: 'VIM',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('accessArrangementsList')).toBeTruthy()
    })

    test('requires question reader reason when relevant access arrangement is selected', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['QNR'],
        questionReaderReason: '',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('questionReaderReasonsList')).toBeTruthy()
    })
    test('requires additional information to be filled when other reader reason is selected', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['QNR'],
        questionReaderReason: 'OTH',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('questionReaderOtherInformation')).toBeTruthy()
    })
    test('ignores pupilUrlSlug value when isEditView is true ', () => {
      const requestData = {
        isEditView: 'true',
        accessArrangements: ['ATA'],
        questionReaderReason: 'VIM',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
    test('ignores accessArrangementsCodes array when isEditView is true ', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        isEditView: 'true',
        questionReaderReason: 'VIM',
        nextButtonInforamtion: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
  })
})
