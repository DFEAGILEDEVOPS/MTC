'use strict'

/* global describe expect it fail */
const detectQuestionsAfterCutoff = require('../../service/detections/detect-answer-responses-after-cutoff')
const { isArray, isPlainObj } = require('ramda-adjunct')

describe('detect answer responses after cutoff', () => {
  it('is defined', () => {
    expect(detectQuestionsAfterCutoff).toBeDefined()
  })

  it('is a function', () => {
    expect(typeof detectQuestionsAfterCutoff).toBe('function')
  })

  it('throws if given undefined as a param', () => {
    try {
      detectQuestionsAfterCutoff(undefined)
      fail()
    } catch (error) {
      expect(error.message).toBe('data should be an object')
    }
  })

  it('throws if given null as a param', () => {
    try {
      detectQuestionsAfterCutoff(null)
      fail()
    } catch (error) {
      expect(error.message).toBe('data should be an object')
    }
  })

  it('throws if given [] as a param', () => {
    try {
      detectQuestionsAfterCutoff([])
      fail()
    } catch (error) {
      expect(error.message).toBe('data should be an object')
    }
  })

  it('returns undefined if the markedAnswers array is not found in the path', () => {
    const r = detectQuestionsAfterCutoff({})
    expect(r).toEqual(undefined)
  })

  it('returns undefined if the markedAnswers array is not an array type', () => {
    const r = detectQuestionsAfterCutoff({ markedAnswers: { answer: {} } })
    expect(r).toBeUndefined()
  })

  it('reports on answers that are registered after the cutoff', () => {
    const data = {
      markedAnswers: {
        answer: [
          {
            id: 1,
            factor1: 2,
            factor2: 5,
            response: '10',
            isCorrect: true,
            questionNumber: 1
          }
        ]
      },
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        answers: [
          {
            'factor1': 2,
            'factor2': 5,
            'answer': '10',
            'sequenceNumber': 1,
            'question': '2x5',
            'clientTimestamp': '2019-06-26T11:00:10.000Z' // way over time
          }
        ],
        audit: [{
          'type': 'QuestionRendered',
          'clientTimestamp': '2019-06-26T11:00:00.000Z',
          'data': {
            'sequenceNumber': 1,
            'question': '1x110'
          }
        },
        {
          'type': 'QuestionTimerStarted',
          'clientTimestamp': '2019-06-26T11:00:00.001Z',
          'data': {
            'sequenceNumber': 1,
            'question': '2x5'
          }
        },
        {
          'type': 'QuestionTimerCancelled',
          'clientTimestamp': '2019-06-26T11:00:06.002Z',
          'data': {
            'sequenceNumber': 1,
            'question': '1x110'
          }
        }
        ]
      }
    }
    const r = detectQuestionsAfterCutoff(data)
    expect(r).toBeDefined()
    expect(isArray(r)).toBe(true)
    expect(isPlainObj(r[0])).toBe(true)
    expect(r[0].Message).toBe('Answer after cutoff')
    expect(r[0]['Tested Value']).toBe('2019-06-26T11:00:10.000Z')
  })

  it('does not report on answers that are registered inside the cutoff', () => {
    const data = {
      markedAnswers: {
        answer: [
          {
            id: 1,
            factor1: 2,
            factor2: 5,
            response: '10',
            isCorrect: true,
            questionNumber: 1
          }
        ]
      },
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        answers: [
          {
            'factor1': 2,
            'factor2': 5,
            'answer': '10',
            'sequenceNumber': 1,
            'question': '2x5',
            'clientTimestamp': '2019-06-26T11:00:06.001Z'
          }
        ],
        audit: [{
          'type': 'QuestionRendered',
          'clientTimestamp': '2019-06-26T11:00:00.000Z',
          'data': {
            'sequenceNumber': 1,
            'question': '1x110'
          }
        },
        {
          'type': 'QuestionTimerStarted',
          'clientTimestamp': '2019-06-26T11:00:00.001Z',
          'data': {
            'sequenceNumber': 1,
            'question': '2x5'
          }
        },
        {
          'type': 'QuestionTimerCancelled',
          'clientTimestamp': '2019-06-26T11:00:06.002Z',
          'data': {
            'sequenceNumber': 1,
            'question': '2x5'
          }
        }
        ]
      }
    }
    const r = detectQuestionsAfterCutoff(data)
    expect(r).toBeDefined()
    expect(isArray(r)).toBe(true)
    expect(r.length).toBe(0)
    console.log(r)
  })

  it('reports on multiple answers that are registered after the cutoff', () => {
    const data = {
      markedAnswers: {
        answer: [
          {
            id: 1,
            factor1: 2,
            factor2: 5,
            response: '10',
            isCorrect: true,
            questionNumber: 1
          },
          {
            id: 1,
            factor1: 3,
            factor2: 6,
            response: '15',
            isCorrect: false,
            questionNumber: 2
          }
        ]
      },
      checkPayload: {
        config: {
          loadingTime: 3,
          questionTime: 6
        },
        answers: [
          {
            'factor1': 2,
            'factor2': 5,
            'answer': '10',
            'sequenceNumber': 1,
            'question': '2x5',
            'clientTimestamp': '2019-06-26T11:00:10.000Z' // way over time
          },
          {
            'factor1': 3,
            'factor2': 6,
            'answer': '15',
            'sequenceNumber': 2,
            'question': '3x6',
            'clientTimestamp': '2019-06-26T11:00:13.000Z' // over time
          }
        ],
        audit: [
          {
            'type': 'QuestionTimerStarted',
            'clientTimestamp': '2019-06-26T11:00:00.001Z',
            'data': {
              'sequenceNumber': 1,
              'question': '2x5'
            }
          },
          {
            'type': 'QuestionTimerStarted',
            'clientTimestamp': '2019-06-26T11:00:06.000Z',
            'data': {
              'sequenceNumber': 2,
              'question': '3x6'
            }
          }
        ]
      }
    }
    const r = detectQuestionsAfterCutoff(data)
    expect(r.length).toBe(2)
    expect(r[0]['Question number']).toBe(1)
    expect(r[1]['Question number']).toBe(2)
  })
})
