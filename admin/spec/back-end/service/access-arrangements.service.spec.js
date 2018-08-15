'use strict'
/* global describe, it, expect spyOn */

const accessArrangementsService = require('../../../services/access-arrangements.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const questionReaderReasonsDataService = require('../../../services/data-access/question-reader-reasons.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')

describe('accessArrangementsService', () => {
  describe('getAccessArrangements', () => {
    it('calls and return access arrangements list', async () => {
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
    it('calls and return access arrangements list', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsByCodes').and.returnValue([{id: 1}])
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
    it('throws an error if pupil is not supplied', async () => {
      const requestData = {
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      try {
        await accessArrangementsService.submit(requestData, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('No pupil selected')
      }
    })
    it('throws an error if accessArrangement codes are not supplied', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      try {
        await accessArrangementsService.submit(requestData, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('No access arrangements selected')
      }
    })
    it('throws an error if accessArrangement are not found based on codes provided', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA'],
        questionReaderReason: '',
        inputAssistanceInformation: '',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsByCodes').and.returnValue([])
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
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsByCodes').and.returnValue([{id: 1}])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue()
      try {
        await accessArrangementsService.submit(requestData, 12345, 1)
      } catch (error) {
        expect(error.message).toBe('Pupil url slug does not match a pupil record')
      }
    })
    it('exoects inputAssistanceInformation to be defined when the accessArrangements is matched', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['ATA', 'ITA'],
        questionReaderReason: '',
        inputAssistanceInformation: 'inputAssistanceInformation',
        questionReaderOtherInformation: ''
      }
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsByCodes').and.returnValue([{id: 1}, {id: 2}])
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
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsByCodes').and.returnValue([{id: 1}, {id: 3}])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonByCode').and.returnValue({id: 1})
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
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsByCodes').and.returnValue([{id: 1}, {id: 3}])
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({id: 1})
      spyOn(questionReaderReasonsDataService, 'sqlFindQuestionReaderReasonByCode').and.returnValue({id: 4})
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
