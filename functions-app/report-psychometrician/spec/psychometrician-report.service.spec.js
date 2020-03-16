'use strict'
/* global describe, expect, it, beforeEach, fail, spyOn, beforeAll */

const moment = require('moment')
const R = require('ramda')

// A mock completed Check that has been marked
const completedCheckMockOrig = require('./mocks/completed-check-with-results')
const checkFormMock = require('./mocks/check-form')

describe('psychometricians-report.service', () => {
  let psychometricianDataService, psychometricianReportCacheDataService, service

  beforeAll(() => {
    psychometricianDataService = require('../service/data-service/psychometrician.data.service')
    psychometricianReportCacheDataService = require('../service/data-service/psychometrician-report-cache.data.service')
    service = require('../service/psychometrician-report.service')
  })

  describe('#batchProduceCacheData', () => {
    const checkMock = Object.assign({}, checkFormMock)
    checkMock.formData = JSON.stringify(checkFormMock.formData)
    beforeEach(() => {
      spyOn(psychometricianDataService, 'sqlFindCompletedChecksByIds').and.returnValue([
        { id: 9, pupil_id: 1, checkForm_id: 2, description: 'Completed', payload: { data: { access_token: 'access_token' } } },
        { id: 10, pupil_id: 2, checkForm_id: 3, description: 'Started' },
        { id: 11, pupil_id: 3, checkForm_id: 4 }
      ])
      spyOn(psychometricianDataService, 'sqlFindPupilsByIds').and.returnValue([
        { id: 1, school_id: 5 },
        { id: 2, school_id: 6 },
        { id: 3, school_id: 7 }
      ])
      spyOn(psychometricianDataService, 'getCheckFormsByIds').and.returnValue([
        { id: 2, formData: checkMock.formData },
        { id: 3, formData: checkMock.formData },
        { id: 4, formData: checkMock.formData }
      ])
      spyOn(psychometricianDataService, 'sqlFindAnswersByCheckIds').and.returnValue({
        9: [],
        10: [],
        11: []
      })
      spyOn(psychometricianDataService, 'sqlFindSchoolsByIds').and.returnValue([
        { id: 5 },
        { id: 6 },
        { id: 7 }
      ])
      spyOn(service, 'produceReportData')
      spyOn(psychometricianReportCacheDataService, 'sqlInsertMany')
    })

    it('throws an error out if checks are not found', async () => {
      psychometricianDataService.sqlFindCompletedChecksByIds.and.returnValue(undefined)
      try {
        await service.batchProduceCacheData([1, 2, 3])
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('batchProduceCacheData(): Failed to find any checks')
      }
    })

    it('retrieves all data service data in one go', async () => {
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(psychometricianDataService.sqlFindCompletedChecksByIds).toHaveBeenCalledTimes(1)
        expect(psychometricianDataService.getCheckFormsByIds).toHaveBeenCalledTimes(1)
        expect(psychometricianDataService.sqlFindSchoolsByIds).toHaveBeenCalledTimes(1)
        expect(psychometricianDataService.sqlFindAnswersByCheckIds).toHaveBeenCalledTimes(1)
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
        expect(secondArgsSet[0].checkStatus).toBe('Started')
      } catch (error) {
        fail(error)
      }
    })
  })

  describe('#produceReportData', () => {
    it('returns the data', () => {
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
        { id: 1, factor1: 2, factor2: 5, answer: '10', isCorrect: 1 },
        { id: 2, factor1: 11, factor2: 2, answer: '22', isCorrect: 1 },
        { id: 3, factor1: 5, factor2: 10, answer: '', isCorrect: 0 },
        { id: 4, factor1: 4, factor2: 4, answer: '16', isCorrect: 1 },
        { id: 5, factor1: 3, factor2: 9, answer: '27', isCorrect: 1 },
        { id: 6, factor1: 2, factor2: 4, answer: '8', isCorrect: 1 },
        { id: 7, factor1: 3, factor2: 3, answer: '9', isCorrect: 1 },
        { id: 8, factor1: 4, factor2: 9, answer: '36', isCorrect: 1 },
        { id: 9, factor1: 6, factor2: 5, answer: '30', isCorrect: 1 },
        { id: 10, factor1: 12, factor2: 12, answer: '144', isCorrect: 1 }
      ]
      const checkForm = Object.assign({}, checkFormMock)
      checkForm.formData = JSON.parse(checkForm.formData)
      const completedCheck = Object.assign({}, completedCheckMockOrig)
      const data = service.produceReportData(completedCheck, markedAnswers, pupil, checkForm, school)
      expect(data).toBeTruthy()
      expect(data.PupilId).toBeTruthy()
      expect(data.TestDate).toBe('20180211')
      expect(data.Q1Sco).toBe(1)
      expect(data.Q2Sco).toBe(1)
      expect(data.Q3Sco).toBe(0)
      expect(data.Q4Sco).toBe(1)
      expect(data.Q5Sco).toBe(1)
    })

    it('does not throw an error if an event does not have an eventType', () => {
      // spyOn(logger, 'info')
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
        { id: 1, factor1: 2, factor2: 5, answer: '10', isCorrect: 1 },
        { id: 2, factor1: 11, factor2: 2, answer: '22', isCorrect: 1 },
        { id: 3, factor1: 5, factor2: 10, answer: '', isCorrect: 0 },
        { id: 4, factor1: 4, factor2: 4, answer: '16', isCorrect: 1 },
        { id: 5, factor1: 3, factor2: 9, answer: '27', isCorrect: 1 },
        { id: 6, factor1: 2, factor2: 4, answer: '8', isCorrect: 1 },
        { id: 7, factor1: 3, factor2: 3, answer: '9', isCorrect: 1 },
        { id: 8, factor1: 4, factor2: 9, answer: '36', isCorrect: 1 },
        { id: 9, factor1: 6, factor2: 5, answer: '30', isCorrect: 1 },
        { id: 10, factor1: 12, factor2: 12, answer: '144', isCorrect: 1 }
      ]
      const checkForm = Object.assign({}, checkFormMock)
      checkForm.formData = JSON.parse(checkForm.formData)
      const completedCheck = Object.assign({}, completedCheckMockOrig)

      // Test setup: an input event without an eventType, and also add a null element
      completedCheck.data.inputs.splice(2, 0, {
        input: 'x',
        clientTimestamp: '2018-02-11T15:42:42.305Z',
        question: '2x5',
        sequenceNumber: 1
      })

      completedCheck.checkCount = 1
      completedCheck.checkStatus = 'Complete'
      try {
        const data = service.produceReportData(completedCheck, markedAnswers, pupil, checkForm, school)
        expect(data).toBeTruthy()
      } catch (error) {
        fail(error)
      }
    })
  })

  describe('#produceReportDataV2', () => {
    let row

    beforeEach(() => {
      row = {
        foreName: 'Penelope',
        lastName: 'Pitstop',
        upn: 'Y883121301222',
        gender: 'F',
        dateOfBirth: '21/06/1923',
        maxMark: 25,
        mark: 14,
        checkPayload: JSON.stringify(R.prop('data', completedCheckMockOrig)),
        restartCode: 'CLD',
        restartCount: 1,
        attendanceCode: 'JSTAR',
        schoolName: 'Wacky Races Driving School',
        schoolEstabCode: '1999',
        schoolUrn: 89000,
        schoolLeaCode: 999,
        checkCode: '763AD270-278D-4221-886C-23FF7E5E5736',
        checkFormName: 'MTC100',
        pupilLoginDate: '2018-02-11T15:42:18.062Z',
        checkStartedAt: '2018-02-11T15:42:38.787Z',
        markedAnswers: JSON.stringify(
          [
            {
              id: 1,
              factor1: 2,
              factor2: 5,
              response: '10',
              isCorrect: true,
              questionNumber: 1
            }
          ]
        )
      }
    })

    it('outputs the ForeName', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Forename).toBe('Penelope')
    })

    it('outputs the Surname', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Surname).toBe('Pitstop')
    })

    it('outputs the PupilID', () => {
      const out = service.produceReportDataV2(row)
      expect(out.PupilId).toBe('Y883121301222')
    })

    it('outputs the gender', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Gender).toBe('F')
    })

    it('outputs the dateOfBirth', () => {
      const out = service.produceReportDataV2(row)
      expect(out.DOB).toBe('21/06/1923')
    })

    it('outputs the FormMark', () => {
      const out = service.produceReportDataV2(row)
      expect(out.FormMark).toBe(14)
    })

    it('outputs the questionTime config', () => {
      const out = service.produceReportDataV2(row)
      expect(out.QDisplayTime).toBe(6)
    })

    it('outputs the PauseLength config', () => {
      const out = service.produceReportDataV2(row)
      expect(out.PauseLength).toBe(3)
    })

    it('outputs the Access Arrangements', () => {
      const out = service.produceReportDataV2(row)
      expect(out.AccessArr).toBe('[3][5]')
    })

    it('outputs the Restart Reason', () => {
      const out = service.produceReportDataV2(row)
      expect(out.RestartReason).toBe(3)
    })

    it('outputs the Restart Count', () => {
      const out = service.produceReportDataV2(row)
      expect(out.RestartNumber).toBe(1)
    })

    it('outputs the reason for not taking the check', () => {
      const out = service.produceReportDataV2(row)
      expect(out.ReasonNotTakingCheck).toBe(6)
    })

    it('outputs the PupilStatus', () => {
      const out = service.produceReportDataV2(row)
      expect(out.PupilStatus).toBe('Not taking the check')
    })

    it('outputs the device type', () => {
      const out = service.produceReportDataV2(row)
      expect(out.DeviceType).toBe('desktop')
    })

    it('outputs the device model', () => {
      const out = service.produceReportDataV2(row)
      expect(out.DeviceTypeModel).toBe('Other')
    })

    it('outputs the device ID', () => {
      const out = service.produceReportDataV2(row)
      expect(out.DeviceId).toBe('5c1809a2107ed421b7cf67ae7b120d90ce510cd5')
    })

    it('outputs the browser type', () => {
      const out = service.produceReportDataV2(row)
      expect(out.BrowserType).toBe('Safari 12.1.2 / Mac OS X 10.14.6')
    })

    it('outputs the school name', () => {
      const out = service.produceReportDataV2(row)
      expect(out['School Name']).toBe('Wacky Races Driving School')
    })

    it('outputs the school estab code', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Estab).toBe('1999')
    })

    it('outputs the school URN', () => {
      const out = service.produceReportDataV2(row)
      expect(out['School URN']).toBe(89000)
    })

    it('outputs the school LA Code', () => {
      const out = service.produceReportDataV2(row)
      expect(out['LA Num']).toBe(999)
    })

    it('outputs the attempt ID', () => {
      const out = service.produceReportDataV2(row)
      expect(out.AttemptId).toBe('763AD270-278D-4221-886C-23FF7E5E5736')
    })

    it('outputs the Form ID', () => {
      const out = service.produceReportDataV2(row)
      expect(out['Form ID']).toBe('MTC100')
    })

    it('outputs the test date', () => {
      const out = service.produceReportDataV2(row)
      expect(out.TestDate).toBe('20180211')
    })

    it('outputs the test start timestamp', () => {
      const out = service.produceReportDataV2(row)
      expect(out.TimeStart).toBe('3:42:38 pm')
    })

    it('outputs the test end timestamp', () => {
      const out = service.produceReportDataV2(row)
      expect(out.TimeComplete).toBe('3:43:26 pm')
    })

    it('outputs the time taken', () => {
      const out = service.produceReportDataV2(row)
      expect(out.TimeTaken).toBe('00:00:48')
    })

    it('outputs the question id', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1ID).toBe('2 x 5')
    })

    it('outputs the response', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1Response).toBe('10')
    })

    it('outputs the inputs methods used by the pupil', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1InputMethods).toBe('k')
    })

    it('outputs the user inputs from the pupil', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1K).toBe('k[1], k[0], k[Enter]')
    })

    it('outputs the score', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1Sco).toBe(1)
    })

    it('outputs the response time taken by the pupil', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1ResponseTime).toBe(0.109)
    })

    it('outputs the TimeOut flag', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1TimeOut).toBe(0)
    })

    it('outputs the TimeOutResponse flag', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1TimeOutResponse).toBe('')
    })

    it('outputs the TimeOutSco flag', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1TimeOutSco).toBe('')
    })

    it('outputs the load time', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1tLoad).toBe('2018-02-11T15:42:24.003Z')
    })

    it('outputs the time of the first key', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1tFirstKey).toBe('2018-02-11T15:42:42.191Z')
    })

    it('outputs the time of the last key', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1tLastKey).toBe('2018-02-11T15:42:42.300Z')
    })

    it('outputs the overall time', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1OverallTime).toBe(18.297)
    })

    it('outputs the recall time', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1RecallTime).toBe(18.188)
    })

    it('outputs the reader start time', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1ReaderStart).toBe('')
    })

    it('outputs the reader end time', () => {
      const out = service.produceReportDataV2(row)
      expect(out.Q1ReaderEnd).toBe('')
    })
  })
})
