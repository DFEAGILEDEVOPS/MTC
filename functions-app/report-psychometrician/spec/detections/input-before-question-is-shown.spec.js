'use strict'
/* global describe, it, expect */

const detectInputBeforeQuestionIsShown = require('../../service/detections/detect-input-before-question-is-shown')

describe('#detectInputBeforeQuestionIsShown', () => {
  it('detects input shown before the question timer is started', () => {
    const mockData = {
      markedAnswers: [
        {
          id: 1,
          factor1: 2,
          factor2: 5,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ],
      checkPayload: {
        inputs: [
          {
            input: '',
            eventType: 'touchstart',
            clientTimestamp: '2019-06-10T08:20:31.740Z',
            question: '2x5',
            sequenceNumber: 1
          },
          {
            input: '1',
            eventType: 'click',
            clientTimestamp: '2019-06-10T08:20:31.853Z',
            question: '2x5',
            sequenceNumber: 1
          },
          {
            input: '',
            eventType: 'touchstart',
            clientTimestamp: '2019-06-10T08:20:32.168Z',
            question: '2x5',
            sequenceNumber: 1
          },
          {
            input: '0',
            eventType: 'click',
            clientTimestamp: '2019-06-10T08:20:32.277Z',
            question: '2x5',
            sequenceNumber: 1
          }
        ],
        audit: [
          {
            type: 'fooType',
            clientTimestamp: '2019-06-10T08:20:31.640Z',
            sequenceNumber: 1
          },
          {
            type: 'QuestionTimerStarted',
            data: {
              sequenceNumber: 1,
              question: '2x10'
            },
            clientTimestamp: '2019-06-10T08:20:31.960Z'
          }
        ]
      }
    }
    const res = detectInputBeforeQuestionIsShown(mockData)
    expect(Array.isArray(res)).toBe(true)
    // if there are multiple inputs detected for a single check we only want
    // to report it once.
    expect(res.length).toBe(1)
    expect(res[0].Message).toBe('Input received before Question shown')
    expect(res[0]['Question number']).toBe(1)
  })

  it('does not report anything if there is nothing to report', () => {
    const mockData = {
      markedAnswers: [
        {
          id: 1,
          factor1: 2,
          factor2: 5,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ],
      checkPayload: {
        inputs: [
          {
            input: '',
            eventType: 'touchstart',
            clientTimestamp: '2019-06-10T08:20:32.168Z',
            question: '2x5',
            sequenceNumber: 1
          },
          {
            input: '0',
            eventType: 'click',
            clientTimestamp: '2019-06-10T08:20:32.277Z',
            question: '2x5',
            sequenceNumber: 1
          }
        ],
        audit: [
          {
            type: 'fooType',
            clientTimestamp: '2019-06-10T08:20:31.640Z',
            sequenceNumber: 1
          },
          {
            type: 'QuestionTimerStarted',
            data: {
              sequenceNumber: 1,
              question: '2x10'
            },
            clientTimestamp: '2019-06-10T08:20:31.960Z'
          }
        ]
      }
    }
    const res = detectInputBeforeQuestionIsShown(mockData)
    expect(res).toEqual([])
  })

  it('reports if it cannot find the questionTimerStartedAudit', () => {
    const mockData = {
      markedAnswers: [
        {
          id: 1,
          factor1: 2,
          factor2: 5,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ],
      audit: []
    }
    const res = detectInputBeforeQuestionIsShown(mockData)
    expect(res[0].Message).toBe('QuestionTimerStarted not found')
  })

  it('reports if the QuestionTimerStarted timestamp is not valid', () => {
    const mockData = {
      markedAnswers: [
        {
          id: 1,
          factor1: 2,
          factor2: 10,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ],
      checkPayload: {
        audit: [
          {
            type: 'fooType',
            clientTimestamp: '2019-06-10T08:20:31.640Z',
            sequenceNumber: 1
          },
          {
            type: 'QuestionTimerStarted',
            data: {
              sequenceNumber: 1,
              question: '2x10'
            },
            clientTimestamp: '2019-02-31T08:20:31.960Z'
          }
        ]
      }
    }
    const res = detectInputBeforeQuestionIsShown(mockData)
    expect(res[0].Message).toBe('QuestionTimerStarted Timestamp is not valid')
  })

  it('returns an empty array if there arent any inputs', () => {
    const mockData = {
      markedAnswers: [
        {
          id: 1,
          factor1: 2,
          factor2: 10,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ],
      checkPayload: {
        audit: [
          {
            type: 'fooType',
            clientTimestamp: '2019-06-10T08:20:31.640Z',
            sequenceNumber: 1
          },
          {
            type: 'QuestionTimerStarted',
            data: {
              sequenceNumber: 1,
              question: '2x10'
            },
            clientTimestamp: '2019-06-10T08:20:31.960Z'
          }
        ]
      }
    }
    const res = detectInputBeforeQuestionIsShown(mockData)
    expect(res).toEqual([])
  })

  it('ignores inputs that have invalid timestamps', () => {
    const mockData = {
      markedAnswers: [
        {
          id: 1,
          factor1: 2,
          factor2: 10,
          response: '10',
          isCorrect: true,
          questionNumber: 1
        }
      ],
      checkPayload: {
        inputs: [
          {
            input: '9',
            eventType: 'keydown',
            clientTimestamp: '2019-02-31T08:20:31.740Z',
            question: '2x10',
            sequenceNumber: 1
          }
        ],
        audit: [
          {
            type: 'fooType',
            clientTimestamp: '2019-06-10T08:20:31.640Z',
            sequenceNumber: 1
          },
          {
            type: 'QuestionTimerStarted',
            data: {
              sequenceNumber: 1,
              question: '2x10'
            },
            clientTimestamp: '2019-06-10T08:20:31.960Z'
          }
        ]
      }
    }
    const res = detectInputBeforeQuestionIsShown(mockData)
    expect(res).toEqual([])
  })
})
