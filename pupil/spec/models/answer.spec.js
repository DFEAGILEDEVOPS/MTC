'use strict'

/* global describe beforeEach it expect */

const Answer = require('../../models/answer')
const mongoose = require('mongoose')
let answer

describe('answer schema', function () {
  beforeEach(function () {
    answer = new Answer({
      sessionId: 'abc123',
      testId: 'test1',
      logonEvent: mongoose.Types.ObjectId(),
      pupil: mongoose.Types.ObjectId(),
      school: 9991001,
      creationDate: new Date(),
      answers: [{answerDate: Date.now(), factor1: 12, factor2: 1}],
      registeredInputs: [{input: 'left click', eventType: 'mousedown', clientInputDate: new Date()}]
    })
  })

  it('validates a correct model', function (done) {
    answer.validate(function (err) {
      expect(err).toBe(null)
      done()
    })
  })

  it('it should be invalid if sessionId is empty', function (done) {
    let a = new Answer()
    a.validate(function (err) {
      expect(err.errors.sessionId).toBeDefined()
      done()
    })
  })

  it('it should be invalid if testId is empty', function (done) {
    let a = new Answer()
    a.validate(function (err) {
      expect(err.errors.testId).toBeDefined()
      done()
    })
  })

  it('it should be invalid if answerDate, factor1 or factor2 is empty', function (done) {
    let a = new Answer()
    a.answers = [{}]
    a.validate(function (err) {
      expect(err.errors.hasOwnProperty('answers.0.answerDate')).toBe(true)
      expect(err.errors.hasOwnProperty('answers.0.factor1')).toBe(true)
      expect(err.errors.hasOwnProperty('answers.0.factor2')).toBe(true)
      done()
    })
  })

  it('negative factors should be invalid', function (done) {
    let a = new Answer({testId: 'a', sessionId: 's'})
    a.answers = [{ answerDate: Date.now(), factor1: -1, factor2: 1 }]
    a.validate(function (err) {
      expect(err.errors.hasOwnProperty('answers.0.factor1')).toBe(true)
      done()
    })
  })

  it('factors over 12 should be invalid', function (done) {
    let a = new Answer({testId: 'a', sessionId: 's'})
    a.answers = [{ answerDate: Date.now(), factor1: 13, factor2: 1 }]
    a.validate(function (err) {
      expect(err.errors.hasOwnProperty('answers.0.factor1')).toBe(true)
      done()
    })
  })

  it('the Answer model can be turned into an object without id or creationDate', function () {
    let a = new Answer({testId: 'a', sessionId: 's'})
    a.answers = [{ answerDate: Date.now(), factor1: 12, factor2: 1 }]
    let res = a.toPojo()
    expect(res.testId).toBe('a')
    expect(res.sessionId).toBe('s')
    expect(res._id).toBeUndefined()
    expect(res.creationDate).toBeUndefined()
    expect(res.answers[0]._id).toBeUndefined()
  })

  it('can mark results', function () {
    let a = new Answer({testId: 'a', sessionId: 's'})
    a.answers = [
      { answerDate: Date.now(), factor1: 12, factor2: 1, input: 12 },
      { answerDate: Date.now(), factor1: 2, factor2: 1, input: 0 },
      { answerDate: Date.now(), factor1: 3, factor2: 1, input: 'x' },
      { answerDate: Date.now(), factor1: 4, factor2: 1, input: '-1' },
      { answerDate: Date.now(), factor1: 5, factor2: 5, input: '5' }
    ]

    a.markResults()

    expect(a.answers[0].isCorrect).toBeDefined()
    expect(a.answers[0].isCorrect).toBe(true)
    expect(a.answers[1].isCorrect).toBeDefined()
    expect(a.answers[1].isCorrect).toBe(false)
    expect(a.result).toBeDefined()
    expect(a.result.correct).toBeDefined()
    expect(a.result.correct).toBe(1)
    expect(a.result.isPass).toBeDefined()
    expect(a.result.isPass).toBe(false)
    expect(a.answers[2].isCorrect).toBe(false)
  })

  it('sets creationDate automatically', function () {
    let a = new Answer({testId: 'a', sessionId: 's'})
    expect(a.creationDate).toBeDefined()
  })

  it('requires a logonEvent Id', function (done) {
    let a = new Answer({testId: 'a', sessionId: 's'})
    a.validate(error => {
      expect(error.errors.logonEvent).toBeDefined()
      done()
    })
  })

  it('requires a pupil', function (done) {
    answer.pupil = undefined
    answer.validate(error => {
      expect(error.errors.pupil).toBeDefined()
      done()
    })
  })

  it('requires a school', function (done) {
    answer.school = undefined
    answer.validate(error => {
      expect(error.errors.school).toBeDefined()
      done()
    })
  })

  it('electron is set by default to false', function (done) {
    const a = new Answer()
    a.validate(() => {
      expect(answer.isElectron).toBe(false)
      done()
    })
  })
})
