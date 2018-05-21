'use strict'
/* global describe, expect, it, beforeEach, fail, spyOn */

const moment = require('moment')
const winston = require('winston')

const answerDataService = require('../../services/data-access/answer.data.service')
const checkFormService = require('../../services/check-form.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const psychometricianReportCacheDataService = require('../../services/data-access/psychometrician-report-cache.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')

// A mock completed Check that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')
const checkFormMock = require('../mocks/check-form')

describe('psychometricians-report.service', () => {
  const service = require('../../services/psychometrician-report.service')

  describe('#batchProduceCacheData', () => {
    const checkMock = Object.assign({}, checkFormMock)
    checkMock.formData = JSON.stringify(checkFormMock.formData)
    beforeEach(() => {
      spyOn(completedCheckDataService, 'sqlFindByIds').and.returnValue([
        {id: 9, pupil_id: 1, checkForm_id: 2, data: { 'data': {'access_token': 'access_token'} }},
        {id: 10, pupil_id: 2, checkForm_id: 3},
        {id: 11, pupil_id: 3, checkForm_id: 4}
      ])
      spyOn(pupilDataService, 'sqlFindByIds').and.returnValue([
        {id: 1, school_id: 5},
        {id: 2, school_id: 6},
        {id: 3, school_id: 7}
      ])
      spyOn(checkFormService, 'getCheckFormsByIds').and.returnValue([
        {id: 2, formData: checkMock.formData},
        {id: 3, formData: checkMock.formData},
        {id: 4, formData: checkMock.formData}
      ])
      spyOn(schoolDataService, 'sqlFindByIds').and.returnValue([
        {id: 5},
        {id: 6},
        {id: 7}
      ])
      spyOn(answerDataService, 'sqlFindByCheckIds').and.returnValue({
        9: [],
        10: [],
        11: []
      })
      spyOn(service, 'produceReportData')
      spyOn(psychometricianReportCacheDataService, 'sqlInsertMany')
    })
    it('throws an error if not provided with an argument', async () => {
      try {
        await service.batchProduceCacheData()
        fail('expected to be thrown')
      } catch (error) {
        expect(error.message).toBe('Missing argument: batchIds')
      }
    })

    it('throws an error if not provided with a array of positive length', async () => {
      try {
        await service.batchProduceCacheData(123)
        fail('expected to be thrown')
      } catch (error) {
        expect(error.message).toBe('Invalid arg: batchIds')
      }
    })

    it('throws an error out if checks are not found', async () => {
      completedCheckDataService.sqlFindByIds.and.returnValue(undefined)
      try {
        await service.batchProduceCacheData([1, 2, 3])
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Failed to find any checks')
      }
    })

    it('retrieves all data service data in one go', async () => {
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(completedCheckDataService.sqlFindByIds).toHaveBeenCalledTimes(1)
        expect(checkFormService.getCheckFormsByIds).toHaveBeenCalledTimes(1)
        expect(schoolDataService.sqlFindByIds).toHaveBeenCalledTimes(1)
        expect(answerDataService.sqlFindByCheckIds).toHaveBeenCalledTimes(1)
      } catch (error) {
        fail(error)
      }
    })

    it('calls produceReportData for each check with the right arguments', async () => {
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(service.produceReportData).toHaveBeenCalledTimes(3)
        const firstArgsSet = service.produceReportData.calls.argsFor(0)
        const secondArgsSet = service.produceReportData.calls.argsFor(1)
        expect(secondArgsSet[0].id).toBe(10) // check
        expect(typeof secondArgsSet[1]).toBe('object') // answers
        expect(secondArgsSet[2].id).toBe(2) // pupil
        expect(secondArgsSet[3].id).toBe(3) // checkForm
        expect(secondArgsSet[4].id).toBe(6) // school
        expect(secondArgsSet[0].checkCount).toBe(1)
        expect(firstArgsSet[0].checkStatus).toBe('Completed')
        expect(secondArgsSet[0].checkStatus).toBe('Started, not completed')
      } catch (error) {
        fail(error)
      }
    })
  })

  describe('#produceReportData', () => {
    it('returns the data', () => {
      spyOn(winston, 'info')
      const pupil = {
        id: 12,
        foreName: 'Mocky',
        middleNames: 'Mockable',
        lastName: 'McMock',
        dateOfBirth: moment().subtract(8, 'years'),
        upn: 'F673001000200',
        gender: 'M',
        status: 'Complete'
      }
      const school = {
        id: 99,
        name: 'Schooly McSchool',
        leaCode: '999',
        estabCode: 1999,
        dfeNumber: 9991999,
        urn: 'URN99'
      }
      const markedAnswers = [
        {id: 1, factor1: 2, factor2: 5, answer: '10', isCorrect: 1},
        {id: 2, factor1: 11, factor2: 2, answer: '22', isCorrect: 1},
        {id: 3, factor1: 5, factor2: 10, answer: '', isCorrect: 0},
        {id: 4, factor1: 4, factor2: 4, answer: '16', isCorrect: 1},
        {id: 5, factor1: 3, factor2: 9, answer: '27', isCorrect: 1},
        {id: 6, factor1: 2, factor2: 4, answer: '8', isCorrect: 1},
        {id: 7, factor1: 3, factor2: 3, answer: '9', isCorrect: 1},
        {id: 8, factor1: 4, factor2: 9, answer: '36', isCorrect: 1},
        {id: 9, factor1: 6, factor2: 5, answer: '30', isCorrect: 1},
        {id: 10, factor1: 12, factor2: 12, answer: '144', isCorrect: 1}
      ]
      const checkForm = Object.assign({}, checkFormMock)
      checkForm.formData = JSON.parse(checkForm.formData)
      const completedCheck = Object.assign({}, completedCheckMockOrig)
      completedCheck.checkCount = 1
      completedCheck.checkStatus = 'Complete'
      const data = service.produceReportData(completedCheck, markedAnswers, pupil, checkForm, school)
      expect(data).toBeTruthy()
      expect(data.PupilId).toBeTruthy()
      expect(data.TestDate).toBe('20180211')
      expect(data.Q1Sco).toBe(1)
      expect(data.Q2Sco).toBe(1)
      expect(data.Q3Sco).toBe(0)
      expect(data.Q4Sco).toBe(1)
      expect(data.Q5Sco).toBe(1)
      expect(data.CheckCount).toBe(1)
      expect(data.CheckStatus).toBe('Complete')
    })
  })

  describe('#generateReport', () => {
    beforeEach(() => {
      spyOn(psychometricianReportCacheDataService, 'sqlFindAll').and.returnValue([
        {jsonData: {PupilId: 'valOne', propTwo: 1}},
        {jsonData: {Mark: 'ValTwo', propTwo: 2}},
        {jsonData: {Response: 'valThree', propTwo: null}}
      ])
    })

    it('returns a csv string', async () => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('PupilId')
    })
  })

  describe('#generateScoreReport', () => {
    beforeEach(async () => {
      spyOn(psychometricianReportCacheDataService, 'sqlFindAll').and.returnValue([
        {jsonData: {PupilId: 'valOne', propTwo: 1}},
        {jsonData: {Mark: 'ValTwo', propTwo: 2}},
        {jsonData: {Response: 'valThree', propTwo: null}}
      ])
    })

    it('returns a csv string', async () => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('PupilId')
    })
  })

  describe('#produceReportDataHeaders', () => {
    it('returns headers from a completed check when one exists', () => {
      const results = [
        { jsonData: { PupilId: 'valOne', propTwo: 1 } },
        { jsonData: { Mark: 'ValTwo', propTwo: 2 } },
        {
          jsonData: {
            DOB: '06/03/2009',
            Gender: 'F',
            PupilId: 'N801200001014',
            Forename: 'Gregory',
            Surname: 'Duke',
            FormMark: 0,
            GroupTiming: 5,
            PauseLength: 2,
            SpeechSynthesis: false,
            DeviceType: 'Other',
            BrowserType: 'Chrome 65.0.3325 / Mac OS X 10.13.4',
            'School Name': 'Example School One',
            Estab: '1001',
            'School URN': 89001,
            'LA Num': 999,
            AttemptId: 'A27BFE36-2EF2-4638-97C7-875F51CDA768',
            'Form ID': 'MTC0100',
            TestDate: '20180425',
            PupilStatus: 'Completed',
            ReasonNotTakingCheck: '',
            RestartReason: '',
            RestartNumber: '',
            TimeStart: '12: 16: 49 pm',
            TimeComplete: '12: 18: 05 pm',
            TimeTaken: '00: 01: 17',
            Q1ID: '2 x 5',
            Q1Response: '2',
            Q1InputMethod: 'k',
            Q1K: 'k[2], k[Enter]',
            Q1Sco: 0,
            Q1ResponseTime: 0,
            Q1TimeOut: 0,
            Q1TimeOutResponse: '',
            Q1TimeOutSco: '',
            Q1tLoad: '2018-04-25T11: 16: 51.135Z',
            Q1tFirstKey: '2018-04-25T11: 16: 51.831Z',
            Q1tLastKey: '2018-04-25T11: 16: 51.831Z',
            Q1OverallTime: 0.696,
            Q1RecallTime: 0.696
          }
        }
      ]
      const headers = service.produceReportDataHeaders(results)
      expect(headers.includes('Q1ID')).toBeTruthy()
    })
    it('returns headers from a check without question data if a completed check does not exist', () => {
      const results = [
        { jsonData: { PupilId: 'valOne', propTwo: 1 } },
        { jsonData: { Mark: 'ValTwo', propTwo: 2 } } ]
      const headers = service.produceReportDataHeaders(results)
      expect(headers.includes('Q1ID')).toBeFalsy()
    })
  })
})
