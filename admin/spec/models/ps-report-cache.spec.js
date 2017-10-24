'use strict'

/* global beforeEach, describe, it, expect */

const { Types } = require('mongoose')
const PsReportCache = require('../../models/ps-report-cache')

describe('PsReportCache schema', () => {
  let model

  beforeEach(() => {
    model = new PsReportCache({
      checkId: Types.ObjectId(),
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

  it('requires the checkId field', async (done) => {
    model.checkId = undefined

    model.validate(err => {
      expect(err).toBeDefined()
      expect(err.errors.checkId).toBeTruthy()
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
