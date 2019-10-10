'use strict'
/* global describe it expect */
const getQuestionTimerEndEvent = require('../../service/detections/get-question-timer-end-event')

describe('get question timer end date for question', () => {
  it('is defined', () => {
    expect(getQuestionTimerEndEvent).toBeDefined()
  })

  it('returns a function', () => {
    expect(typeof getQuestionTimerEndEvent).toEqual('function')
  })

  it('returns the QuestionTimerCancelled event if found', () => {
    const r = getQuestionTimerEndEvent([
      {},
      {
        type: 'QuestionTimerCancelled',
        clientTimestamp: '2019-06-27T12:46:25.671Z',
        data: {
          sequenceNumber: 1,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(r.type).toEqual('QuestionTimerCancelled')
    expect(r.data.sequenceNumber).toBe(1)
    expect(r.data.question).toEqual('1x10')
  })

  it('returns the QuestionTimerEnded event if the QuestionTimerCancelled is not found', () => {
    const r = getQuestionTimerEndEvent([
      {},
      {
        type: 'QuestionTimerEnded',
        clientTimestamp: '2019-06-27T12:46:25.671Z',
        data: {
          sequenceNumber: 1,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(r.type).toEqual('QuestionTimerEnded')
    expect(r.data.sequenceNumber).toBe(1)
    expect(r.data.question).toEqual('1x10')
  })

  it('does not return if the question does not match', () => {
    const r = getQuestionTimerEndEvent([
      {},
      {
        type: 'QuestionTimerEnded',
        clientTimestamp: '2019-06-27T12:46:25.671Z',
        data: {
          sequenceNumber: 1,
          question: '1x11'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('does not return if the sequence number does not match', () => {
    const r = getQuestionTimerEndEvent([
      {},
      {
        type: 'QuestionTimerEnded',
        clientTimestamp: '2019-06-27T12:46:25.671Z',
        data: {
          sequenceNumber: 2,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is null', () => {
    const r = getQuestionTimerEndEvent(null,
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is undefined', () => {
    const r = getQuestionTimerEndEvent(undefined,
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is a string', () => {
    const r = getQuestionTimerEndEvent('foo',
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is an empty string', () => {
    const r = getQuestionTimerEndEvent('',
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is an object ', () => {
    const r = getQuestionTimerEndEvent({},
      1, 1, 10)
    expect(r).toBeUndefined()
  })
})
