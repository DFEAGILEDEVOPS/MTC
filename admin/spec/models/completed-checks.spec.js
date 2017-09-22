'use strict'
/* global describe expect it beforeEach */

const CompletedChecks = require('../../models/completed-checks')

describe('CompletedChecks model', () => {
  let check

  beforeEach(() => {
    check = new CompletedChecks({
      data: {},
      receivedByServerAt: Date.now()
    })
  })

  it('validates a valid model', (done) => {
    check.validate((err) => {
      expect(err).toBeNull()
      done()
    })
  })

  it('receivedByServerAt is a required field ', (done) => {
    check.receivedByServerAt = undefined
    check.validate(err => {
      expect(err).toBeDefined()
      expect(err.message).toBe('completedChecks validation failed')
      expect(err.errors.receivedByServerAt).toBeDefined()
      done()
    })
  })
})
