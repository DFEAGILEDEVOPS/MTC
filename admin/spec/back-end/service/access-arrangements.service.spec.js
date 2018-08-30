'use strict'
/* global describe, it, expect spyOn */

const accessArrangementsService = require('../../../services/access-arrangements.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const questionReaderReasonsDataService = require('../../../services/data-access/question-reader-reasons.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../../../lib/validator/access-arrangements-validator.js')
const ValidationError = require('../../../lib/validation-error')
const accessArrangementsErrorMessages = require('../../../lib/errors/access-arrangements')

describe('accessArrangementsService', () => {
  describe('getAccessArrangements', () => {
    it('calls and returns access arrangements list', async () => {
      const accessArrangements = [
        {
          id: 1,
          displayOrder: 1,
          description: 'description',
          code: 'COD'
        }
      ]
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangements').and.returnValue(accessArrangements)
      const result = await accessArrangementsService.getAccessArrangements()
      expect(accessArrangementsDataService.sqlFindAccessArrangements).toHaveBeenCalled()
      expect(result).toBe(accessArrangements)
    })
  })
  describe('submit', () => {
    it('calls and returns access arrangements list', async () => {
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsService, 'process')
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      spyOn(accessArrangementsService, 'save')
      await accessArrangementsService.submit({}, 12345, 1)
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
      expect(accessArrangementsService.process).toHaveBeenCalled()
      expect(accessArrangementsService.save).toHaveBeenCalled()
    })
    it('throws a validation error if validation is unsuccessful', async () => {
      const validationError = new ValidationError()
      validationError.addError('pupil-autocomplete-container', accessArrangementsErrorMessages.missingPupilName)
      validationError.addError('accessArrangementsList', accessArrangementsErrorMessages.missingAccessArrangements)
      spyOn(accessArrangementsValidator, 'validate').and.returnValue(validationError)
      spyOn(accessArrangementsService, 'process')
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      spyOn(accessArrangementsService, 'save')
      try {
        await accessArrangementsService.submit({}, 12345, 1)
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).not.toHaveBeenCalled()
      expect(accessArrangementsService.process).not.toHaveBeenCalled()
      expect(accessArrangementsService.save).not.toHaveBeenCalled()
    })
  })
  describe('process', () => {
    it('returns a processed access arrangements submission object', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }])
      const result = await accessArrangementsService.process(requestData, {id: 1}, 12345, 1)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsIdsWithCodes).toHaveBeenCalled()
      expect(result).toEqual(Object({pupil_id: 1, accessArrangementsIdsWithCodes: [{id: 1, code: 'ATA'}], recordedBy_user_id: 1, questionReaderReasonCode: ''}))
    })
    it('throws an error if accessArrangement are not found based on codes provided', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATS'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([])
      try {
        await accessArrangementsService.process(requestData, {id: 1}, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('No access arrangements found')
      }
    })
    it('throws an error if pupil record is not found', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([1])
      try {
        await accessArrangementsService.process(requestData, {}, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('Pupil object is not found')
      }
    })
    it('expects inputAssistanceInformation to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA', 'ITA'],
        questionReaderReason: '',
        inputAssistanceInformation: 'inputAssistanceInformation',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }, { id: 2, code: 'ITA' }])
      const result = await accessArrangementsService.process(requestData, {id: 1}, 12345, 1)
      expect(result).toEqual(Object({pupil_id: 1, accessArrangementsIdsWithCodes: [{ id: 1, code: 'ATA' }, { id: 2, code: 'ITA' }], recordedBy_user_id: 1, inputAssistanceInformation: 'inputAssistanceInformation', questionReaderReasonCode: ''}))
    })
    it('expects questionReaderReasons_id to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA', 'QNR'],
        questionReaderReason: 'VIM',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }, { id: 3, code: 'QNR' }])
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonIdByCode').and.returnValue(1)
      const result = await accessArrangementsService.process(requestData, {id: 1}, 12345, 1)
      expect(questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode).toHaveBeenCalled()
      expect(result).toEqual(Object({pupil_id: 1, accessArrangementsIdsWithCodes: [{ id: 1, code: 'ATA' }, { id: 3, code: 'QNR' }], recordedBy_user_id: 1, questionReaderReasonCode: 'VIM', questionReaderReasons_id: 1}))
    })
    it('expects questionReaderOtherInformation to be defined when the accessArrangements and questionReaderReason is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA', 'QNR'],
        questionReaderReason: 'OTH',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: 'questionReaderOtherInformation'
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }, { id: 3, code: 'QNR' }])
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonIdByCode').and.returnValue(4)
      const result = await accessArrangementsService.process(requestData, {id: 1}, 12345, 1)
      expect(result).toEqual(Object({pupil_id: 1, accessArrangementsIdsWithCodes: [{ id: 1, code: 'ATA' }, { id: 3, code: 'QNR' }], recordedBy_user_id: 1, questionReaderReasonCode: 'OTH', questionReaderReasons_id: 4, questionReaderOtherInformation: 'questionReaderOtherInformation'}))
    })
  })
  describe('save', () => {
    it('calls sqlInsertAccessArrangements without isUpdated boolean if pupilAccessArrangement record does not exist', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId')
      spyOn(pupilAccessArrangementsDataService, 'sqlInsertAccessArrangements')
      const pupil = await accessArrangementsService.save({}, {id: '1', urlSlug: 'pupilUrlSlug'})
      expect(pupilAccessArrangementsDataService.sqlInsertAccessArrangements).toHaveBeenCalledWith({})
      expect(pupil.urlSlug).toBe('pupilUrlSlug')
    })
    it('calls sqlInsertAccessArrangements with isUpdated boolean if pupilAccessArrangement record exists', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([{pupil_id: 1}])
      spyOn(pupilAccessArrangementsDataService, 'sqlInsertAccessArrangements')
      await accessArrangementsService.save({}, {id: '1', urlSlug: 'pupilUrlSlug'})
      expect(pupilAccessArrangementsDataService.sqlInsertAccessArrangements).toHaveBeenCalledWith({}, true)
    })
  })
})
