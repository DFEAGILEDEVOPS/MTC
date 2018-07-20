'use strict'
/* global describe, expect, it, beforeEach, spyOn */

const moment = require('moment')
const R = require('ramda')

const psUtilService = require('../../../services/psychometrician-util.service')
const completedCheckMockOrig = require('../mocks/completed-check-with-results')
const checkFormMockOrig = require('../mocks/check-form')

describe('anomaly-report.service', () => {
  const service = require('../../../services/anomaly-report.service')

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
      ]
      service.reportedAnomalies = []
      spyOn(service, 'getCheckDate').and.returnValue('date')
      service.produceReportData(completedCheckMockOrig, 'message', 1, 2, 3)
      expect(service.reportedAnomalies.length).toBe(1)
      expect(service.reportedAnomalies[0]).toEqual({ check_id: completedCheckMockOrig.id, jsonData: reportData })
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
      service.detectAnomalies(check)
      expect(service.detectWrongNumberOfAnswers).toHaveBeenCalledWith(check)
      expect(service.detectAnswersCorrespondToQuestions).toHaveBeenCalledWith(check)
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
        checkMock.data.audit = [ { type: 'QuestionRendered' } ]
        service.detectApplicationErrors(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports anomaly when check has application errors', () => {
        checkMock.data.audit = [ { type: 'AppError' } ]
        service.detectApplicationErrors(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectInputBeforeOrAfterTheQuestionIsShown', () => {
      let startTime, secondTime
      beforeEach(() => {
        startTime = moment()
        secondTime = startTime.clone()
        secondTime.add(5, 'seconds')
        checkMock.data.audit = [
          {
            type: 'PauseRendered',
            clientTimestamp: startTime.toISOString(),
            data: { sequenceNumber: 1 }
          }, {
            type: 'QuestionRendered',
            clientTimestamp: startTime.toISOString(),
            data: { sequenceNumber: 1 }
          }, {
            type: 'PauseRendered',
            clientTimestamp: secondTime.toISOString(),
            data: { sequenceNumber: 2 }
          }, {
            type: 'QuestionRendered',
            clientTimestamp: secondTime.toISOString(),
            data: { sequenceNumber: 2 }
          }
        ]
        checkMock.data.questions = [ { order: 1, factor1: 1, factor2: 1 }, { order: 2, factor1: 2, factor2: 2 } ]
      })

      it('does not report an anomaly when there are no inputs before or after the question was shown', () => {
        checkMock.data.inputs = [
          {
            input: '1',
            eventType: 'keyDown',
            clientTimestamp: startTime.add(2, 'seconds').toISOString(),
            sequenceNumber: 1,
            question: '1x1'
          },
          {
            input: '2',
            eventType: 'keyDown',
            clientTimestamp: secondTime.add(3, 'seconds').toISOString(),
            sequenceNumber: 2,
            question: '2x2'
          }
        ]

        service.detectInputBeforeOrAfterTheQuestionIsShown(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports an anomaly when there are inputs before the question was shown', () => {
        checkMock.data.inputs = [
          {
            input: '1',
            eventType: 'keyDown',
            clientTimestamp: startTime.subtract(1, 'seconds').toISOString(),
            sequenceNumber: 1,
            question: '1x1'
          },
          {
            input: '2',
            eventType: 'keyDown',
            clientTimestamp: secondTime.subtract(1, 'seconds').toISOString(),
            sequenceNumber: 2,
            question: '2x2'
          }
        ]

        service.detectInputBeforeOrAfterTheQuestionIsShown(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(2)
      })

      it('reports an anomaly when there are inputs after the question was shown', () => {
        const extraTime = checkMock.data.config.questionTime * 1.06 // * 1.05 is the maximum

        checkMock.data.inputs = [
          {
            input: '1',
            eventType: 'keyDown',
            clientTimestamp: startTime.add(extraTime, 'seconds').toISOString(),
            sequenceNumber: 1,
            question: '1x1'
          },
          {
            input: '2',
            eventType: 'keyDown',
            clientTimestamp: secondTime.add(extraTime, 'seconds').toISOString(),
            sequenceNumber: 2,
            question: '2x2'
          }
        ]

        service.detectInputBeforeOrAfterTheQuestionIsShown(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(2)
      })
    })

    describe('#detectMissingAudits', () => {
      it('does not report an anomaly when there are no missing audits', () => {
        service.detectMissingAudits(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports an anomaly when there are missing QuestionRendered audits', () => {
        const firstIdx = checkMock.data.audit.findIndex(({ type }) => type === 'QuestionRendered')
        checkMock.data.audit = [ ...checkMock.data.audit.slice(0, firstIdx), ...checkMock.data.audit.slice(firstIdx + 1) ]
        service.detectMissingAudits(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })

      it('reports an anomaly when there are missing PauseRendered audits', () => {
        const firstIdx = checkMock.data.audit.findIndex(({ type }) => type === 'PauseRendered')
        checkMock.data.audit = [ ...checkMock.data.audit.slice(0, firstIdx), ...checkMock.data.audit.slice(firstIdx + 1) ]
        service.detectMissingAudits(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })

      it('reports an anomaly for each missing single mandatory audits', () => {
        const singleMandatoryAuditEvents = [
          'WarmupStarted',
          'WarmupIntroRendered',
          'WarmupCompleteRendered',
          'CheckStarted',
          'CheckStartedApiCalled',
          'CheckSubmissionPending'
        ]

        checkMock.data.audit = checkMock.data.audit.filter(({ type }) => !singleMandatoryAuditEvents.includes(type))
        service.detectMissingAudits(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(singleMandatoryAuditEvents.length)
      })
    })

    describe('#detectInputsWithoutQuestionInformation', () => {
      it('does not report an anomaly when all inputs have question information', () => {
        service.detectInputsWithoutQuestionInformation(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports an anomaly when there are inputs that do not have question information', () => {
        checkMock.data.inputs[0].sequenceNumber = undefined
        service.detectInputsWithoutQuestionInformation(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectChecksThatTookLongerThanTheTheoreticalMax', () => {
      it('does not report an anomaly when all checks took a normal duration', () => {
        service.detectChecksThatTookLongerThanTheTheoreticalMax(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('report an anomaly when there is no CheckStarted audit event', () => {
        checkMock.data.audit = checkMock.data.audit.filter(({ type }) => type !== 'CheckStarted')
        service.detectChecksThatTookLongerThanTheTheoreticalMax(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })

      it('report an anomaly when there is no CheckSubmissionPending audit event', () => {
        checkMock.data.audit = checkMock.data.audit.filter(({ type }) => type !== 'CheckSubmissionPending')
        service.detectChecksThatTookLongerThanTheTheoreticalMax(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })

      it('report an anomaly when there is an error for the CheckStarted audit event', () => {
        spyOn(psUtilService, 'getClientTimestampFromAuditEvent').and.returnValues(['error', moment().toISOString()])
        service.detectChecksThatTookLongerThanTheTheoreticalMax(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })

      it('report an anomaly when there is an error for the CheckSubmissionPending audit event', () => {
        spyOn(psUtilService, 'getClientTimestampFromAuditEvent').and.returnValues([moment().toISOString(), 'error'])
        service.detectChecksThatTookLongerThanTheTheoreticalMax(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })

      it('report an anomaly when the check takes longer than the theoretical max', () => {
        const numberOfQuestions = checkMock.data.questions.length
        const config = checkMock.data.config
        const theoreticalMax = (numberOfQuestions * config.loadingTime) +
          (numberOfQuestions * config.questionTime) +
          (config.speechSynthesis ? numberOfQuestions * 2.5 : 0)

        const startTime = moment()
        const endTime = startTime.add(theoreticalMax + 1, 'seconds') // longer by 1 second than the max

        spyOn(psUtilService, 'getClientTimestampFromAuditEvent').and.returnValues([startTime.toISOString(), endTime.toISOString()])
        service.detectChecksThatTookLongerThanTheTheoreticalMax(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectInputThatDoesNotCorrespondToAnswers', () => {
      it('does not report an anomaly when all inputs correspond to answers', () => {
        service.detectInputThatDoesNotCorrespondToAnswers(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports an anomaly when there are inputs that do not correspond to answers', () => {
        checkMock.data.answers = [ { factor1: 4, factor2: 4, answer: '16' } ]
        spyOn(service, 'filterInputsForQuestion')
        spyOn(service, 'reconstructAnswerFromInputs').and.returnValue('15')
        service.detectInputThatDoesNotCorrespondToAnswers(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectAnswersCorrespondToQuestions', () => {
      it('does not report an anomaly when all answers correspond to questions', () => {
        const checkMockWithForm = {
          ...checkMock,
          formData: checkFormMockOrig.formData
        }
        service.detectAnswersCorrespondToQuestions(checkMockWithForm)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports an anomaly when there are answers that do not correspond to questions', () => {
        const checkMockWithForm = {
          ...checkMock,
          formData: checkFormMockOrig.formData
        }
        checkMockWithForm.data.answers = [ ...checkMockWithForm.data.answers, { factor1: 0, factor2: 0 } ]
        service.detectAnswersCorrespondToQuestions(checkMockWithForm)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })

    describe('#detectQuestionsThatWereShownForTooLong', () => {
      it('does not report an anomaly when questions are not shown for too long', () => {
        service.detectQuestionsThatWereShownForTooLong(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(0)
      })

      it('reports an anomaly when there are questions shown for too long', () => {
        const startTime = moment()
        const timeAfterQuestions = i => startTime.add(i * (checkMock.data.config.questionTime * 1.06), 'seconds').toISOString()
        spyOn(service, 'filterAllRealQuestionsAndPauseAudits').and.returnValue([
          {
            type: 'PauseRendered',
            clientTimestamp: startTime,
            sequenceNumber: 1
          }, {
            type: 'QuestionRendered',
            clientTimestamp: startTime,
            sequenceNumber: 1
          }, {
            type: 'PauseRendered',
            clientTimestamp: timeAfterQuestions(1),
            sequenceNumber: 2
          }, {
            type: 'QuestionRendered',
            clientTimestamp: timeAfterQuestions(1),
            sequenceNumber: 2
          }, {
            type: 'PauseRendered',
            clientTimestamp: timeAfterQuestions(2),
            sequenceNumber: 3
          }, {
            type: 'QuestionRendered',
            clientTimestamp: timeAfterQuestions(2),
            sequenceNumber: 3
          }
        ])
        service.detectQuestionsThatWereShownForTooLong(checkMock)
        expect(service.produceReportData).toHaveBeenCalledTimes(1)
      })
    })
  })
})
