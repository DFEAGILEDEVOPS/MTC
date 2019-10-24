'use strict'
/* global describe it expect */

const moment = require('moment')
const RA = require('ramda-adjunct')

const getQuestionTimerStartEvent = require('../../service/detections/get-question-timer-start-event')

describe('get question timer start date for question', () => {
  it('is defined', () => {
    expect(getQuestionTimerStartEvent).toBeDefined()
  })

  it('returns a function', () => {
    expect(typeof getQuestionTimerStartEvent).toEqual('function')
  })

  it('returns the QuestionTimerStarted event if found', () => {
    const r = getQuestionTimerStartEvent([
      {},
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2019-06-27T12:46:25.671Z',
        data: {
          sequenceNumber: 1,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(r.type).toEqual('QuestionTimerStarted')
    expect(r.data.sequenceNumber).toBe(1)
    expect(r.data.question).toEqual('1x10')
  })

  it('adds a \'momentTimestamp\' prop if valid', () => {
    const r = getQuestionTimerStartEvent([
      {},
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2019-06-27T12:46:25.671Z',
        data: {
          sequenceNumber: 1,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(moment.isMoment(r.momentTimestamp)).toBe(true)
  })

  it('does not add a momentTimestamp prop if it is invalid date', () => {
    const r = getQuestionTimerStartEvent([
      {},
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '2019-02-30T12:46:25.671Z',
        data: {
          sequenceNumber: 1,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(moment.isMoment(r.clientTimestamp)).toBe(false)
    expect(RA.isString(r.clientTimestamp)).toBe(true)
    expect(r.momentTimestamp).toBeUndefined()
  })

  it('does not instantiate a datetime if the clientTimestamp is missing', () => {
    const r = getQuestionTimerStartEvent([
      {},
      {
        type: 'QuestionTimerStarted',
        clientTimestamp: '',
        data: {
          sequenceNumber: 1,
          question: '1x10'
        }
      },
      {}
    ],
    1, 1, 10)
    expect(r.clientTimestamp).toBe('')
  })

  it('does not return if the question does not match', () => {
    const r = getQuestionTimerStartEvent([
      {},
      {
        type: 'QuestionTimerStarted',
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
    const r = getQuestionTimerStartEvent([
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
    const r = getQuestionTimerStartEvent(null,
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is undefined', () => {
    const r = getQuestionTimerStartEvent(undefined,
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is a string', () => {
    const r = getQuestionTimerStartEvent('foo',
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is an empty string', () => {
    const r = getQuestionTimerStartEvent('',
      1, 1, 10)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the audits is an object ', () => {
    const r = getQuestionTimerStartEvent({},
      1, 1, 10)
    expect(r).toBeUndefined()
  })
})
