'use strict'

/* global describe it expect */
const getAnswer = require('../../service/detections/get-answer.js')
const moment = require('moment')
const { clone } = require('ramda')

const answers = [
  {
    'factor1': 11,
    'factor2': 3,
    'answer': '33',
    'sequenceNumber': 1,
    'question': '11x3',
    'clientTimestamp': '2019-06-26T11:01:56.193Z'
  },
  {
    'factor1': 5,
    'factor2': 10,
    'answer': '50',
    'sequenceNumber': 2,
    'question': '5x10',
    'clientTimestamp': '2019-06-26T11:02:01.346Z'
  },
  {
    'factor1': 12,
    'factor2': 2,
    'answer': '24',
    'sequenceNumber': 3,
    'question': '12x2',
    'clientTimestamp': '2019-06-26T11:02:08.944Z'
  },
  {
    'factor1': 3,
    'factor2': 6,
    'answer': '18',
    'sequenceNumber': 4,
    'question': '3x6',
    'clientTimestamp': '2019-06-26T11:02:15.734Z'
  }
]

describe('get answer', () => {
  it('is defined', () => {
    expect(getAnswer).toBeDefined()
  })

  it('is a function', () => {
    expect(typeof getAnswer).toBe('function')
  })

  it('returns undefined if the answer arg is not an array (undefined)', () => {
    expect(getAnswer(undefined)).toBeUndefined()
  })

  it('returns undefined if the answer arg is not an array (object)', () => {
    expect(getAnswer({})).toBeUndefined()
  })

  it('returns undefined if the answer arg is not an array (null)', () => {
    expect(getAnswer(null)).toBeUndefined()
  })

  it('returns the answer for the question', () => {
    const r = getAnswer(answers, 3)
    expect(r.answer).toBe('24')
  })

  it('returns undefined if the timestamp is invalid', () => {
    const ans = clone(answers)
    ans[3].clientTimestamp = '2019-02-30T11:01:56.193Z'
    const r = getAnswer(ans, 4)
    expect(moment.isMoment(r.clientTimestamp)).toBe(false)
    expect(r.clientTimestamp).toBe('2019-02-30T11:01:56.193Z')
  })

  it('returns undefined if the question is larger than the array', () => {
    const r = getAnswer(answers, 5)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the question is smaller than the array', () => {
    const r = getAnswer(answers, 0)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the questionNumber is negative', () => {
    const r = getAnswer(answers, -1)
    expect(r).toBeUndefined()
  })

  it('returns undefined if the questionNumber is a string', () => {
    const r = getAnswer(answers, 'foo')
    expect(r).toBeUndefined()
  })

  it('adds a \'momentTimestamp\' prop if the \'clientTimestamp\' is valid', () => {
    const r = getAnswer(answers, 2)
    expect(moment.isMoment(r.momentTimestamp)).toBe(true)
  })

  it('returns undefined if the answer does not have the correct questionNumber', () => {
    const ans = clone(answers)
    ans[2].sequenceNumber = 99 // should be 3
    const r = getAnswer(ans, 3)
    expect(r).toBeUndefined()
  })
})
