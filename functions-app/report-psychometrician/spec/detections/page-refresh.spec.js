'use strict'
/* global describe, expect, it */

const detectPageRefresh = require('../../service/detections/detect-page-refresh')

describe('#detectPageRefresh', () => {
  it('detects a valid page refresh', () => {
    const audits = [
      { type: 'foo' },
      { type: 'RefreshDetected' },
      { type: 'bar' }
    ]
    const res = detectPageRefresh({ checkPayload: {
      audit: audits
    } })
    expect(res).toEqual({ 'Attempt ID': undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Page refresh detected',
      'Tested Value': 1,
      'Expected Value': 0,
      'Question number': null,
      QuestionReader: 0,
      NextBetweenQuestions: 0,
      InputAssistance: 0
    })
  })
})
