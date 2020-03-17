'use strict'
/* global describe expect it fail */

const RA = require('ramda-adjunct')

const detectCheckTookTooLong = require('../../service/detections/detect-check-took-too-long')

describe('check took too long', () => {
  it('exports a function', () => {
    expect(RA.isFunction(detectCheckTookTooLong)).toBe(true)
  })

  it('throws an error if not passed an object to check', () => {
    try {
      detectCheckTookTooLong([])
      fail('expected to throw')
    } catch (error) {
      expect(error instanceof TypeError).toBe(true)
    }
  })

  it('reports when the check is over time', () => {
    // 10 * (3 + 6) , no QR = 90
    const data = {
      markedAnswers: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' },
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:21:35.100Z' }
        ]
      }
    }

    const r1 = detectCheckTookTooLong(data)
    expect(r1).toBeDefined()
    expect(RA.isPlainObj(r1)).toBe(true)
    expect(r1.Message).toEqual('Check took too long')
    expect(r1['Tested Value']).toBe(91)
    expect(r1['Expected Value']).toBe(90)
  })

  it('does not report when the check is under time', () => {
    const data = {
      markedAnswers: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' },
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:20:35.100Z' }
        ]
      }
    }

    const r1 = detectCheckTookTooLong(data)
    expect(r1).toBeUndefined()
  })

  it('reports when the check is over time with the questionReader', () => {
    // 10 * (3 + 6) + (2.5 * 10), with QR = 115
    const data = {
      markedAnswers: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6,
          questionReader: true
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' },
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:22:00.100Z' }
        ]
      }
    }
    const r1 = detectCheckTookTooLong(data)
    expect(r1).toBeDefined()
    expect(RA.isPlainObj(r1)).toBe(true)
    expect(r1.Message).toEqual('Check took too long')
    expect(r1['Tested Value']).toBe(116)
    expect(r1['Expected Value']).toBe(115)
  })

  it('does not report when the check is on time with the questionReader', () => {
    // 10 * (3 + 6) + (2.5 * 10), with QR = 115
    const data = {
      markedAnswers: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6,
          questionReader: true
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' },
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:21:00.100Z' }
        ]
      }
    }
    const r1 = detectCheckTookTooLong(data)
    expect(r1).toBeUndefined()
  })

  it('does not report when the checkStarted time is missing', () => {
    const data = {
      markedAnswers: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        audit: [
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:21:00.100Z' }
        ]
      }
    }
    const r1 = detectCheckTookTooLong(data)
    expect(r1).toBeUndefined()
  })

  it('does not report when the check completed time is missing', () => {
    const data = {
      markedAnswers: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' }
        ]
      }
    }
    const r1 = detectCheckTookTooLong(data)
    expect(r1).toBeUndefined()
  })

  it('ignores checks that have the next button between questions', () => {
    const data = {
      markedAnswers: [{}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6,
          nextBetweenQuestions: true
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' },
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:22:00.100Z' }
        ]
      }
    }
    const r = detectCheckTookTooLong(data)
    expect(r).toBeUndefined()
  })

  it('ignores checks that have a refresh', () => {
    const data = {
      markedAnswers: [{}],
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-05-31T14:20:04.100Z' },
          { type: 'RefreshDetected', clientTimestamp: '2019-05-T14:21:01.199Z' },
          { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31T14:22:00.100Z' }
        ]
      }
    }
    const r = detectCheckTookTooLong(data)
    expect(r).toBeUndefined()
  })
})
