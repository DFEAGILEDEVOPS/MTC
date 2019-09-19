'use strict'
/* global describe, it, expect */

const detectInputBeforeQuestionIsShown = require('../../service/detections/input-before-question-is-shown')

describe('detectInputBeforeQuestionIsShown', () => {
  it('detects input shown before the question timer is started', () => {
    const mockData = {
      markedAnswers: {
        answer: [
          { id: 1,
            factor1: 2,
            factor2: 5,
            response: '10',
            isCorrect: true,
            questionNumber: 1
          }
        ]
      },
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
  })
})
