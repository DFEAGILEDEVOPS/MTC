'use strict'
/* global describe, expect, it */

const detectWrongNumberOfAnswers = require('../../service/detections/detect-wrong-number-of-answers')

describe('#detectWrongNumberOfAnswers', () => {
  it('does not report an anomaly when check has correct number of answers', () => {
    const res = detectWrongNumberOfAnswers([1, 2, 3], [4, 5, 6])
    expect(res).toBe(true)
  })

  it('reports anomaly when check has wrong number of answers', () => {
    const res = detectWrongNumberOfAnswers([1, 2, 3], [4, 5])
    expect(res).toBe(false)
  })

  it('handles a missing input', () => {
    const res = detectWrongNumberOfAnswers([1, 2, 3], null)
    expect(res).toBe(false)
  })

  it('handles a missing input', () => {
    const res = detectWrongNumberOfAnswers([1, 2, 3], null)
    expect(res).toBe(false)
  })
})
