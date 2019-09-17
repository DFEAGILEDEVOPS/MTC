'use strict'
/* global describe, expect, it, beforeEach */
const R = require('ramda')

const anomalyFileReportService = require('../service/anomaly-file-report.service')
const completedCheckMockOrig = require('./mocks/completed-check-with-results-and-anomalies')
const mockContext = require('../../mock-context')

describe('#anomaly-file-report.service', () => {
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
      markedAnswers: JSON.stringify({ answer: [
        { id: 1,
          factor1: 2,
          factor2: 5,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ] })
    }
  })

  describe('#detectAnomalies', () => {
    it('detects wrong number of answers', () => {
      const res = anomalyFileReportService.detectAnomalies(row, mockContext)
      expect(res[0]).toEqual({ 'Attempt ID': '763AD270-278D-4221-886C-23FF7E5E5736',
        Date: '11/02/2018',
        Mark: '14 out of 25',
        Device: 'Other ',
        Agent: 'Safari 12.1.2 / Mac OS X 10.14.6',
        Message: 'Wrong number of answers',
        'Tested Value': 9,
        'Expected Value': 10,
        'Question number': null })
    })
  })
})
