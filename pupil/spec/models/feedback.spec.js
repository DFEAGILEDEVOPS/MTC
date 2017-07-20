'use strict'
/* global describe it xit expect */

const Feedback = require('../../models/feedback')

const inputStates = [
  'Touchscreen',
  'Mouse',
  'Keyboard',
  'Mix of the above'
]

const satisfactionStates = [
  'Very easy',
  'Easy',
  'Neither easy or difficult',
  'Difficult',
  'Very difficult'
]

describe('feedback schema', function () {
  it('sets a creationDate automatically', function () {
    let f = new Feedback({})
    expect(f.creationDate).toBeDefined()
  })

  xit('accepts valid states for inputType', function (done) {
    inputStates.forEach(function (state) {
      const f = new Feedback({ inputType: state })
      f.validate(function (err) {
        expect(err).toBe(null)
        done()
      })
    })
  })

  xit('accepts valid states for satisfactionRating', function (done) {
    satisfactionStates.forEach(function (state) {
      const f = new Feedback({ satisfactionRating: state })
      f.validate(function (err) {
        expect(err).toBe(null)
        done()
      })
    })
  })

  xit('does not accept an invalid state for satisfactionRating', function (done) {
    const f = new Feedback({ satisfactionRating: 'invalid' })
    f.validate(function (err) {
      expect(err.errors.satisfactionRating).toBeDefined()
      done()
    })
  })

  it('inputType is required', function (done) {
    const f = new Feedback({})
    f.validate(function (err) {
      expect(err.errors.inputType).toBeDefined()
      expect(err.errors.inputType.message).toBe('Please choose an option below')
      done()
    })
  })

  it('satisfactionRating is required', function (done) {
    const f = new Feedback({})
    f.validate(function (err) {
      expect(err.errors.satisfactionRating).toBeDefined()
      expect(err.errors.satisfactionRating.message).toBe('Please choose an option below')
      done()
    })
  })

  it('comment has a maximum length', function (done) {
    let c = 'x'.repeat(1201)
    let f = new Feedback({satisfactionRating: 'Very easy', comment: c})
    f.validate(function (err) {
      expect(err.errors.comment).toBeDefined()
      expect(err.errors.comment.message).toBe('You have exceeded the word limit')
      done()
    })
  })
})
