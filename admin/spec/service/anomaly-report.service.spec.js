'use strict'
/* global describe, expect, it, beforeEach, afterEach, fail, spyOn, jasmine */

const moment = require('moment')
const winston = require('winston')
const R = require('ramda')

const config = require('../../services/config.service')
const anomalyReport = require('../../services/anomaly-report.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const dateService = require('../../services/date.service')
const psUtilService = require('../../services/psychometrician-util.service')
// A mock completed Check that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')

describe('anomaly-report.service', () => {
  const service = require('../../services/anomaly-report.service')

  describe('#produceReportData', () => {
    it('pushes a reported anomaly', async () => {
      const reportData = [
        '763AD270-278D-4221-886C-23FF7E5E5736',
        'date',
        false,
        '9 out of 10',
        'Other ',
        'Other 0.0.0 / Other 0.0.0',
        'message',
        1,
        2,
        3
      ];
      service.reportedAnomalies = []
      spyOn(service, 'getCheckDate').and.returnValue('date')
      service.produceReportData(completedCheckMockOrig, 'message', 1, 2, 3)
      expect(service.reportedAnomalies.length).toBe(1)
      expect(service.reportedAnomalies[0]).toEqual(reportData)
    })
  })

  describe('#detectAnomalies', () => {
    beforeEach(() => {
      spyOn(service, 'detectWrongNumberOfAnswers')
      spyOn(service, 'detectAnswersCorrespondToQuestions')
      spyOn(service, 'detectPageRefresh')
      spyOn(service, 'detectInputBeforeOrAfterTheQuestionIsShown')
      spyOn(service, 'detectMissingAudits')
      spyOn(service, 'detectChecksThatTookLongerThanTheTheoreticalMax')
      spyOn(service, 'detectInputThatDoesNotCorrespondToAnswers')
      spyOn(service, 'detectQuestionsThatWereShownForTooLong')
      spyOn(service, 'detectInputsWithoutQuestionInformation')
      spyOn(service, 'detectApplicationErrors')
      spyOn(service, 'detectLowBattery')
      spyOn(service, 'detectInsufficientVerticalHeight')
      spyOn(service, 'detectLowColourDisplays')
    })

    it('calls all detection methods', async () => {
      const check = 'checkMock'
      const checkForm = 'checkFormMock'
      service.detectAnomalies(check, checkForm)
      expect(service.detectWrongNumberOfAnswers).toHaveBeenCalledWith(check)
      expect(service.detectAnswersCorrespondToQuestions).toHaveBeenCalledWith(check, checkForm)
      expect(service.detectPageRefresh).toHaveBeenCalledWith(check)
      expect(service.detectInputBeforeOrAfterTheQuestionIsShown).toHaveBeenCalledWith(check)
      expect(service.detectMissingAudits).toHaveBeenCalledWith(check)
      expect(service.detectChecksThatTookLongerThanTheTheoreticalMax).toHaveBeenCalledWith(check)
      expect(service.detectInputThatDoesNotCorrespondToAnswers).toHaveBeenCalledWith(check)
      expect(service.detectQuestionsThatWereShownForTooLong).toHaveBeenCalledWith(check)
      expect(service.detectInputsWithoutQuestionInformation).toHaveBeenCalledWith(check)
      expect(service.detectApplicationErrors).toHaveBeenCalledWith(check)
      expect(service.detectLowBattery).toHaveBeenCalledWith(check)
      expect(service.detectInsufficientVerticalHeight).toHaveBeenCalledWith(check)
      expect(service.detectLowColourDisplays).toHaveBeenCalledWith(check)
    })
  })

  describe('Detection methods', () => {
    let checkMock
    beforeEach(() => {
      checkMock = R.clone(completedCheckMockOrig)
      spyOn(service, 'produceReportData')
    })

    describe('#detectWrongNumberOfAnswers', () => {
      it('does not report an anomaly when check has correct number of answers', () => {
        service.detectWrongNumberOfAnswers(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports anomaly when check has wrong number of answers', () => {
        checkMock.data.questions = checkMock.data.questions.slice(1)
        service.detectWrongNumberOfAnswers(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectPageRefresh', () => {
      it('does not report an anomaly when check has no refreshes', () => {
        checkMock.data.audit = [ { type: 'CheckSubmissionPending' } ]
        service.detectPageRefresh(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports anomaly when at least a refresh was found', () => {
        checkMock.data.audit = [{ type: 'RefreshDetected' }]
        service.detectPageRefresh(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectLowBattery', () => {
      it('does not report an anomaly when check has normal levels of battery >20', () => {
        checkMock.data.device = { battery: { levelPercent: 50, isCharging: false } }
        service.detectLowBattery(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('does not report an anomaly when check has low levels of battery but is charging', () => {
        checkMock.data.device = { battery: { levelPercent: 10, isCharging: true } }
        service.detectLowBattery(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports anomaly when check has low levels of battery and is not charging', () => {
        checkMock.data.device = { battery: { levelPercent: 10, isCharging: false } }
        service.detectLowBattery(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectInsufficientVerticalHeight', () => {
      describe('does not report an anomaly when check has normal height', () => {
        it('for width <= 640', () => {
          checkMock.data.device = { screen: { innerHeight: 558, innerWidth: 600 } }
          service.detectInsufficientVerticalHeight(checkMock)
          expect(service.produceReportData).toHaveBeenCalledTimes(0)
        })

        it('for width > 640 and <= 769', () => {
          checkMock.data.device = { screen: { innerHeight: 701, innerWidth: 678 } }
          service.detectInsufficientVerticalHeight(checkMock)
          expect(service.produceReportData).toHaveBeenCalledTimes(0)
        })

        it('for width > 769', () => {
          checkMock.data.device = { screen: { innerHeight: 700, innerWidth: 780 } }
          service.detectInsufficientVerticalHeight(checkMock)
          expect(service.produceReportData).toHaveBeenCalledTimes(0)
        })
      })

      describe('does not report an anomaly when check has insufficient height', () => {
        it('for width <= 640', () => {
          checkMock.data.device = { screen: { innerHeight: 555, innerWidth: 600 } }
          service.detectInsufficientVerticalHeight(checkMock)
          expect(service.produceReportData).toHaveBeenCalledTimes(1)
        })

        it('for width > 640 and <= 769', () => {
          checkMock.data.device = { screen: { innerHeight: 690, innerWidth: 678 } }
          service.detectInsufficientVerticalHeight(checkMock)
          expect(service.produceReportData).toHaveBeenCalledTimes(1)
        })

        it('for width > 769', () => {
          checkMock.data.device = { screen: { innerHeight: 600, innerWidth: 780 } }
          service.detectInsufficientVerticalHeight(checkMock)
          expect(service.produceReportData).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('#detectLowColourDisplays', () => {
      it('does not report an anomaly when check has normal colorDepth', () => {
        checkMock.data.device = { screen: { colorDepth: 24 } }
        service.detectLowColourDisplays(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports anomaly when check has low level of colorDepth', () => {
        checkMock.data.device = { screen: { colorDepth: 16 } }
        service.detectLowColourDisplays(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectApplicationErrors', () => {
      it('does not report an anomaly when check has no application errors', () => {
        checkMock.data.audit = [ { type: "QuestionRendered" } ]
        service.detectApplicationErrors(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports anomaly when check has application errors', () => {
        checkMock.data.audit = [ { type: "AppError" } ]
        service.detectApplicationErrors(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })
  })
})
