'use strict'
/* global describe expect it */

const RA = require('ramda-adjunct')

const filterInputsForQuestion = require('../../service/detections/filter-inputs-for-question.js')

describe('filter input for questions', () => {
  it('is defined', () => {
    expect(filterInputsForQuestion).toBeDefined()
  })

  it('is a function', () => {
    expect(typeof filterInputsForQuestion).toEqual('function')
  })

  it('returns matching inputs', () => {
    const r = filterInputsForQuestion(
      1,
      4,
      2,
      [
        {
          'input': '',
          'eventType': '',
          'clientTimestamp': '',
          'question': '4x2',
          'sequenceNumber': 1
        },
        {
          'input': '',
          'eventType': '',
          'clientTimestamp': '',
          'question': '3x3',
          'sequenceNumber': 2
        }
      ]
    )
    expect(RA.isArray(r)).toBe(true)
    expect(RA.lengthEq(1, r)).toBeTruthy()
  })

  it('does not match inputs only on questionNumber', () => {
    const r = filterInputsForQuestion(
      1,
      4,
      2,
      [
        {
          'input': '',
          'eventType': '',
          'clientTimestamp': '',
          'question': '4x2',
          'sequenceNumber': 1
        },
        {
          'input': '',
          'eventType': '',
          'clientTimestamp': '',
          'question': '3x3',
          'sequenceNumber': 1
        }
      ]
    )
    expect(RA.isArray(r)).toBe(true)
    expect(r.length).toBe(1)
  })

  it('does not match inputs only on the question', () => {
    const r = filterInputsForQuestion(
      1,
      4,
      2,
      [
        {
          'input': '',
          'eventType': '',
          'clientTimestamp': '',
          'question': '4x2',
          'sequenceNumber': 1
        },
        {
          'input': '',
          'eventType': '',
          'clientTimestamp': '',
          'question': '4x2',
          'sequenceNumber': 2
        }
      ]
    )
    expect(RA.isArray(r)).toBe(true)
    expect(r.length).toBe(1)
  })
})
