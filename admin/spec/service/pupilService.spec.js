'use strict'
const pupilService = require('../../services/pupil.service')

/* global beforeEach, describe, it, expect */

describe('pupil service', () => {
  let answers
  beforeEach(function () {
    answers = require('../mocks/answers')
  })

  it('fetchScoreDetails should return hasScore false if answers object is undefined', (done) => {
    const { hasScore } = pupilService.fetchScoreDetails(undefined)
    expect(hasScore).toBeFalsy()
    done()
  })

  it('fetchScoreDetails should return hasScore true if answers object is defined', (done) => {
    const { hasScore } = pupilService.fetchScoreDetails(answers)
    expect(hasScore).toBeTruthy()
    done()
  })

  it('fetchScoreDetails should return n/a score and percentage if answers object is undefined', (done) => {
    const { score, percentage } = pupilService.fetchScoreDetails(undefined)
    expect(score).toBe('N/A')
    expect(percentage).toBe('N/A')
    done()
  })

  it('fetchScoreDetails should return score as a fraction', (done) => {
    const { score } = pupilService.fetchScoreDetails(answers)
    expect(typeof score).toBe('string')
    expect((score).match(/((\d*)\/(\d*))/g).length).toBeGreaterThan(0)
    done()
  })
  it('fetchScoreDetails should return percentage in a appropriate format', (done) => {
    const { percentage } = pupilService.fetchScoreDetails(answers)
    expect(typeof percentage).toBe('string')
    expect((percentage).match(/[0-9]*\.?[0-9]+%/).length).toBeGreaterThan(0)
    done()
  })
})
