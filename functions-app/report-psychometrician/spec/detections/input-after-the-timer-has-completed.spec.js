'use strict'
/* global describe expect it */

const RA = require('ramda-adjunct')
const detectInputAfterTheTimerHasCompleted = require('../../service/detections/detect-input-after-the-timer-has-completed')

describe('input after the timer has completed', () => {
  it('exports a function', () => {
    expect(typeof detectInputAfterTheTimerHasCompleted).toBe('function')
  })

  it('returns undefined if a param is not passed in', () => {
    const r = detectInputAfterTheTimerHasCompleted()
    expect(r).toBeUndefined()
  })

  it('returns an empty array if no anomalies were found', () => {
    const r = detectInputAfterTheTimerHasCompleted({})
    expect(RA.isArray(r)).toBe(true)
  })

  it('returns undefined if an object is not passed in as the param', () => {
    const r = detectInputAfterTheTimerHasCompleted([])
    expect(r).toBeUndefined()
  })

  it('reports being unable to find the keyboard cut-off', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: []
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('QuestionTimerCancelled event not found for question')
    expect(r[0]['Question number']).toBe(1)
  })

  it('reports if it cant find a valid time for the event', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: 'invalid',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('QuestionTimerCancelledEvent timestamp is not valid')
    expect(r[0]['Question number']).toBe(1)
  })

  it('reports if it cant find a valid timestamp property for the event', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '', // falsy
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('QuestionTimerCancelledEvent missing its timestamp')
    expect(r[0]['Question number']).toBe(1)
  })

  it('reports nothing if there are no inputs for a question', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          },
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '',
            data: {
              sequenceNumber: 2,
              question: '3x3'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: '',
            question: '3x3',
            sequenceNumber: 2
          },
          {
            input: '',
            eventType: '',
            clientTimestamp: '',
            question: '3x3',
            sequenceNumber: 2
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('QuestionTimerCancelledEvent missing its timestamp')
    expect(r[0]['Question number']).toBe(1)
  })

  it('reports if the input timestamp is missing', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '2019-06-27T12:46:25.671Z',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: '',
            question: '1x10',
            sequenceNumber: 1
          },
          {
            input: '',
            eventType: '',
            clientTimestamp: '',
            question: '1x10',
            sequenceNumber: 1
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('input timestamp is missing')
    expect(r[0]['Question number']).toBe(1)
  })

  it('reports if the input timestamp is not a date', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '2019-06-27T12:46:25.671Z',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: 'error not a date',
            question: '1x10',
            sequenceNumber: 1
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('input timestamp is not valid')
    expect(r[0]['Question number']).toBe(1)
  })

  it('reports if the input timestamp is a bad date', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '2019-06-27T12:46:25.671Z',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: '2019-12-327T12:12:12.121Z', // Dec 32 is just wrong
            question: '1x10',
            sequenceNumber: 1
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('input timestamp is not valid')
    expect(r[0]['Question number']).toBe(1)
  })

  it('can parse a year beyond 2030, 24H hours, 00 minutes', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '2040-12-31T13:12:00.777Z',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: '2040-12-31T13:12:00.777Z', // 2040
            question: '1x10',
            sequenceNumber: 1
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r).toEqual([]) // no output, all pass
  })

  it('reports on inputs with late timestamps', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '2019-06-27T12:46:25.671Z',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: '2019-06-27T12:46:25.672Z', // 1/1000 of a second over the limit
            question: '1x10',
            sequenceNumber: 1
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r[0].Message).toBe('Input received after timer cut-off')
    expect(r[0]['Question number']).toBe(1)
    expect(r[0]['Tested Value']).toEqual('2019-06-27T12:46:25.672Z')
    expect(r[0]['Expected Value']).toEqual('2019-06-27T12:46:25.671Z')
  })

  it('removes duplicate reports', () => {
    const r = detectInputAfterTheTimerHasCompleted({
      checkPayload: {
        audit: [
          {
            type: 'QuestionTimerCancelled',
            clientTimestamp: '2019-06-27T12:46:25.671Z',
            data: {
              sequenceNumber: 1,
              question: '1x10'
            }
          }
        ],
        inputs: [
          {
            input: '',
            eventType: '',
            clientTimestamp: '2019-06-27T12:46:25.672Z', // 1/1000 of a second over the limit
            question: '1x10',
            sequenceNumber: 1
          },
          {
            input: '',
            eventType: '',
            clientTimestamp: '2019-06-27T12:46:25.673Z', // 2/1000 of a second over the limit
            question: '1x10',
            sequenceNumber: 1
          }
        ]
      },
      markedAnswers: {
        answer: [
          {
            id: 1,
            answer: '10',
            factor1: 1,
            factor2: 10,
            questionNumber: 1
          }
        ]
      }
    })
    expect(r.length).toBe(1)
  })
})
