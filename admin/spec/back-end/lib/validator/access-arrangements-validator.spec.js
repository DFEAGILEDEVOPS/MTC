'use strict'

/* global describe, it expect */
const accessArrangementsValidator = require('../../../../lib/validator/access-arrangements-validator')

describe('Access arrangements validator', function () {
  describe('validate', function () {
    it('returns validationError object with no errors if the validation is successful', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: 'VIM',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeFalsy()
    })
    it('requires a pupil UrlSlug', () => {
      const requestData = {
        accessArrangements: ['ATA'],
        questionReaderReason: 'VIM',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('pupil-autocomplete-container')).toBeTruthy()
    })
    it('requires an access arrangement selection', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        questionReaderReason: 'VIM',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('accessArrangementsList')).toBeTruthy()
    })
    it('requires input assistance information when relevant access arrangement is selected', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ITA'],
        questionReaderReason: 'VIM',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('inputAssistanceInformation')).toBeTruthy()
    })
    it('requires question reader reason when relevant access arrangement is selected', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['QNR'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('questionReaderReasonsList')).toBeTruthy()
    })
    it('requires additional information to be filled when other reader reason is selected', () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['QNR'],
        questionReaderReason: 'OTH',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = accessArrangementsValidator.validate(requestData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.isError('questionReaderOtherInformation')).toBeTruthy()
    })
  })
})
