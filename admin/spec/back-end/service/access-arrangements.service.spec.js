'use strict'
/* global describe, it, expect spyOn fail */

const sut = require('../../../services/access-arrangements.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const questionReaderReasonsDataService = require('../../../services/data-access/question-reader-reasons.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../../../lib/validator/access-arrangements-validator.js')
const ValidationError = require('../../../lib/validation-error')
const accessArrangementsErrorMessages = require('../../../lib/errors/access-arrangements')
const preparedCheckSyncService = require('../../../services/prepared-check-sync.service')
const moment = require('moment')

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
      const result = await sut.getAccessArrangements()
      expect(accessArrangementsDataService.sqlFindAccessArrangements).toHaveBeenCalled()
      expect(result).toBe(accessArrangements)
    })
  })
  describe('submit', () => {
    it('calls preparedCheckSync service and returns access arrangements list', async () => {
      spyOn(accessArrangementsValidator, 'validate').and.returnValue((new ValidationError()))
      spyOn(sut, 'prepareData')
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({ id: 1 })
      spyOn(sut, 'save')
      spyOn(preparedCheckSyncService, 'addMessages')
      await sut.submit({}, 12345, 1)
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
      expect(sut.prepareData).toHaveBeenCalled()
      expect(sut.save).toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).toHaveBeenCalled()
    })
    it('throws a validation error if validation is unsuccessful', async () => {
      const validationError = new ValidationError()
      validationError.addError('pupil-autocomplete-container', accessArrangementsErrorMessages.missingPupilName)
      validationError.addError('accessArrangementsList', accessArrangementsErrorMessages.missingAccessArrangements)
      spyOn(accessArrangementsValidator, 'validate').and.returnValue(validationError)
      spyOn(sut, 'prepareData')
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({ id: 1 })
      spyOn(sut, 'save')
      spyOn(preparedCheckSyncService, 'addMessages')
      try {
        await sut.submit({}, 12345, 1)
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).not.toHaveBeenCalled()
      expect(sut.prepareData).not.toHaveBeenCalled()
      expect(sut.save).not.toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).not.toHaveBeenCalled()
    })
  })
  describe('prepareData', () => {
    it('returns a processed access arrangements submission object', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [accessArrangementsDataService.CODES.AUDIBLE_SOUNDS],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        nextButtonInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilColourContrastsId')
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilFontSizesId')
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsIdsWithCodes).toHaveBeenCalled()
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [{ id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS }],
        recordedBy_user_id: 1,
        questionReaderReasonCode: ''
      }))
      expect(pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId).not.toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlFindPupilFontSizesId).not.toHaveBeenCalled()
    })
    it('throws an error if accessArrangement are not found based on codes provided', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATS'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        nextButtonInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([])
      try {
        await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('No access arrangements found')
      }
    })
    it('throws an error if pupil record is not found', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [accessArrangementsDataService.CODES.AUDIBLE_SOUNDS],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        nextButtonInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([1])
      try {
        await sut.prepareData(requestData, {}, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('Pupil object is not found')
      }
    })
    it('expects inputAssistanceInformation to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [
          accessArrangementsDataService.CODES.AUDIBLE_SOUNDS,
          accessArrangementsDataService.CODES.INPUT_ASSISTANCE
        ],
        questionReaderReason: '',
        inputAssistanceInformation: 'inputAssistanceInformation',
        nextButtonInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }, { id: 2, code: 'ITA' }])
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [
          { id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS },
          { id: 2, code: accessArrangementsDataService.CODES.INPUT_ASSISTANCE }
        ],
        recordedBy_user_id: 1,
        inputAssistanceInformation: 'inputAssistanceInformation',
        questionReaderReasonCode: ''
      }))
    })
    it('expects nextButtonInformation to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [
          accessArrangementsDataService.CODES.AUDIBLE_SOUNDS,
          accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS
        ],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        nextButtonInformation: 'nextButtonInformation',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([{ id: 1, code: 'ATA' }, { id: 2, code: 'NBQ' }])
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [
          { id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS },
          { id: 2, code: accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS }
        ],
        recordedBy_user_id: 1,
        nextButtonInformation: 'nextButtonInformation',
        questionReaderReasonCode: ''
      }))
    })
    it('expects questionReaderReasons_id to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [
          accessArrangementsDataService.CODES.AUDIBLE_SOUNDS,
          accessArrangementsDataService.CODES.QUESTION_READER
        ],
        questionReaderReason: questionReaderReasonsDataService.CODES.VISUAL_IMPAIRMENTS,
        inputAssistanceInformation: '',
        nextButtonInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([
        { id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS },
        { id: 3, code: accessArrangementsDataService.CODES.QUESTION_READER }
      ])
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonIdByCode').and.returnValue(1)
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode).toHaveBeenCalled()
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [
          { id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS },
          { id: 3, code: accessArrangementsDataService.CODES.QUESTION_READER }
        ],
        recordedBy_user_id: 1,
        questionReaderReasonCode: questionReaderReasonsDataService.CODES.VISUAL_IMPAIRMENTS,
        questionReaderReasons_id: 1
      }))
    })
    it('expects questionReaderOtherInformation to be defined when the accessArrangements and questionReaderReason is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [
          accessArrangementsDataService.CODES.AUDIBLE_SOUNDS,
          accessArrangementsDataService.CODES.QUESTION_READER
        ],
        questionReaderReason: questionReaderReasonsDataService.CODES.OTHER,
        inputAssistanceInformation: '',
        nextButtonInformation: '',
        questionReaderOtherInformation: 'questionReaderOtherInformation'
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([
        { id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS },
        { id: 3, code: accessArrangementsDataService.CODES.QUESTION_READER }
      ])
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonIdByCode').and.returnValue(4)
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [
          { id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS },
          { id: 3, code: accessArrangementsDataService.CODES.QUESTION_READER }
        ],
        recordedBy_user_id: 1,
        questionReaderReasonCode: questionReaderReasonsDataService.CODES.OTHER,
        questionReaderReasons_id: 4,
        questionReaderOtherInformation: 'questionReaderOtherInformation'
      }))
    })
    it('expects pupilFontSizes_id property and pupilColourContrasts_id property to be set from existing ', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [
          accessArrangementsDataService.CODES.FONT_SIZE,
          accessArrangementsDataService.CODES.COLOUR_CONTRAST
        ],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        nextButtonInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilColourContrastsId').and.returnValue(2)
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilFontSizesId').and.returnValue(4)
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').and.returnValue([
        { id: 2, code: accessArrangementsDataService.CODES.COLOUR_CONTRAST },
        { id: 3, code: accessArrangementsDataService.CODES.FONT_SIZE }
      ])
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId).toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlFindPupilFontSizesId).toHaveBeenCalled()
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [
          { id: 2, code: accessArrangementsDataService.CODES.COLOUR_CONTRAST, pupilColourContrasts_id: 2 },
          { id: 3, code: accessArrangementsDataService.CODES.FONT_SIZE, pupilFontSizes_id: 4 }
        ],
        recordedBy_user_id: 1,
        questionReaderReasonCode: ''
      })
      )
    })
  })
  describe('save', () => {
    it('calls sqlInsertAccessArrangements without isUpdated boolean if pupilAccessArrangement record does not exist', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId')
      spyOn(pupilAccessArrangementsDataService, 'sqlInsertAccessArrangements')
      const pupil = await sut.save({}, { id: '1', urlSlug: 'pupilUrlSlug' })
      expect(pupilAccessArrangementsDataService.sqlInsertAccessArrangements).toHaveBeenCalledWith({})
      expect(pupil.urlSlug).toBe('pupilUrlSlug')
    })
    it('calls sqlInsertAccessArrangements with isUpdated boolean if pupilAccessArrangement record exists', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([{ pupil_id: 1 }])
      spyOn(pupilAccessArrangementsDataService, 'sqlInsertAccessArrangements')
      await sut.save({}, { id: '1', urlSlug: 'pupilUrlSlug' })
      expect(pupilAccessArrangementsDataService.sqlInsertAccessArrangements).toHaveBeenCalledWith({}, true)
    })
  })
  describe('canBeEdited', () => {
    it('should return true if check window is open', () => {
      const currentDate = moment('2020-07-23')
      const checkWindowData = {
        adminStartDate: moment('2020-01-01'),
        checkEndDate: moment('2020-08-01')
      }
      expect(sut.canBeEdited(currentDate, checkWindowData)).toBe(true)
    })
    it('should return false if check window is closed', () => {
      const currentDate = moment('2020-07-23')
      const checkWindowData = {
        adminStartDate: moment('2020-03-01'),
        checkEndDate: moment('2020-07-01')
      }
      expect(sut.canBeEdited(currentDate, checkWindowData)).toBe(false)
    })
  })
})
