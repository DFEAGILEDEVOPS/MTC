'use strict'
/* global describe, expect, it */

const detectWrongNumberOfAnswers = require('../../service/detections/detect-wrong-number-of-answers')

describe('#detectWrongNumberOfAnswers', () => {
  it('does not report an anomaly when check has correct number of answers', () => {
    const res = detectWrongNumberOfAnswers({ checkPayload: {
      answers: [1, 2, 3],
      questions: [4, 5, 6]
    } })
    expect(res).toBe(undefined)
  })

  it('reports anomaly when check has wrong number of answers', () => {
    const res = detectWrongNumberOfAnswers({ checkPayload:
    {
      answers: [1, 2, 3],
      questions: [4, 5]
    } })
    expect(res.Message).toBe('Wrong number of answers')
  })

  it('handles a missing input', () => {
    const res = detectWrongNumberOfAnswers({ checkPayload: {
      questions: [1, 2, 3],
      answers: null
    } })
    expect(res.Message).toBe('Wrong number of answers')
  })
})
