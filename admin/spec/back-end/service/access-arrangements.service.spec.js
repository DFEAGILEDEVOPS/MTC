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
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsByCodes').and.returnValue([1])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      const saveMethodSpy = spyOn(accessArrangementsService, 'save')
      await accessArrangementsService.submit(requestData, 12345, 1)
      expect(saveMethodSpy.calls.all()[0].args[0].accessArrangements_ids).toBe('[1]')
      expect(saveMethodSpy.calls.all()[0].args[0].pupil_id).toBe(1)
      expect(saveMethodSpy.calls.all()[0].args[0].recordedBy_user_id).toBe(1)
      expect(saveMethodSpy.calls.all()[0].args[0].inputAssistanceInformation).toBeUndefined()
      expect(saveMethodSpy.calls.all()[0].args[0].questionReaderOtherInformation).toBeUndefined()
      expect(saveMethodSpy.calls.all()[0].args[1].id).toBe(1)
    })
    it('throws a validation error if validation is unsuccessful', async () => {
      const requestData = {
        pupilUrlSlug: '',
        accessArrangements: undefined,
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      const validationError = new ValidationError()
      validationError.addError('pupil-autocomplete-container', accessArrangementsErrorMessages.missingPupilName)
      validationError.addError('accessArrangementsList', accessArrangementsErrorMessages.missingAccessArrangements)
      spyOn(accessArrangementsValidator, 'validate').and.returnValue(validationError)
      try {
        await accessArrangementsService.submit(requestData, 12345, 1)
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
    })
    it('throws an error if accessArrangement are not found based on codes provided', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsByCodes').and.returnValue([])
      try {
        await accessArrangementsService.submit(requestData, 12345, 1)
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
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsByCodes').and.returnValue([1])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue()
      try {
        await accessArrangementsService.submit(requestData, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('Pupil url slug does not match a pupil record')
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
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsByCodes').and.returnValue([1, 2])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      const saveMethodSpy = spyOn(accessArrangementsService, 'save')
      await accessArrangementsService.submit(requestData, 12345, 1)
      expect(saveMethodSpy.calls.all()[0].args[0].accessArrangements_ids).toBe('[1,2]')
      expect(saveMethodSpy.calls.all()[0].args[0].inputAssistanceInformation).toBeDefined()
    })
    it('expects questionReaderReasons_id to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA', 'QNR'],
        questionReaderReason: 'VIM',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsByCodes').and.returnValue([1, 3])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonIdByCode').and.returnValue(1)
      const saveMethodSpy = spyOn(accessArrangementsService, 'save')
      await accessArrangementsService.submit(requestData, 12345, 1)
      expect(saveMethodSpy.calls.all()[0].args[0].accessArrangements_ids).toBe('[1,3]')
      expect(saveMethodSpy.calls.all()[0].args[0].questionReaderReasons_id).toBe(1)
      expect(saveMethodSpy.calls.all()[0].args[0].questionReaderOtherInformation).toBeUndefined()
    })
    it('expects questionReaderOtherInformation to be defined when the accessArrangements and questionReaderReason is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA', 'QNR'],
        questionReaderReason: 'OTH',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: 'questionReaderOtherInformation'
      }
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsByCodes').and.returnValue([1, 3])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonIdByCode').and.returnValue(4)
      const saveMethodSpy = spyOn(accessArrangementsService, 'save')
      await accessArrangementsService.submit(requestData, 12345, 1)
      expect(saveMethodSpy.calls.all()[0].args[0].accessArrangements_ids).toBe('[1,3]')
      expect(saveMethodSpy.calls.all()[0].args[0].questionReaderReasons_id).toBe(4)
      expect(saveMethodSpy.calls.all()[0].args[0].questionReaderOtherInformation).toBeDefined()
    })
  })
  describe('submit', () => {
    it('calls sqlCreate if pupilAccessArrangement record does not exist', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId')
      spyOn(pupilAccessArrangementsDataService, 'sqlCreate')
      const pupil = await accessArrangementsService.save({}, {id: 1})
      expect(pupilAccessArrangementsDataService.sqlCreate).toHaveBeenCalled()
      expect(pupil.id).toBe(1)
    })
    it('calls sqlUpdate if pupilAccessArrangement record exists', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({pupil_id: 1})
      spyOn(pupilAccessArrangementsDataService, 'sqlUpdate')
      await accessArrangementsService.save({}, {id: 1})
      expect(pupilAccessArrangementsDataService.sqlUpdate).toHaveBeenCalled()
    })
  })
})
