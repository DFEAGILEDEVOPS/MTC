'use strict'

/* global beforeEach, describe, it, expect */

const { Types } = require('mongoose')
const PsReportCache = require('../../models/ps-report-cache')

describe('PsReportCache schema', () => {
  let model

  beforeEach(() => {
    model = new PsReportCache({
      check: Types.ObjectId(),
      data: {a: 'Col A', b: 'Col B'}
    })
  })

  it('requires the data field', async (done) => {
    model.data = undefined

    model.validate(err => {
      expect(err).toBeDefined()
      expect(err.errors.data).toBeTruthy()
      done()
    })
  })

  it('requires the check field', async (done) => {
    model.check = undefined

    model.validate(err => {
      expect(err).toBeDefined()
      expect(err.errors.check).toBeTruthy()
      done()
    })
  })

  it('validates a correct model', async (done) => {
    model.validate(err => {
      expect(err).toBeFalsy()
      done()
    })
  })
})
