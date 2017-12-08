'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const PupilFeedback = require('../../../models/pupil-feedback')
// const pupilFeedback = require('../../mocks/pupil-feedback')

describe('check.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(PupilFeedback.prototype).expects('save')
      service = proxyquire('../../../services/data-access/pupil-feedback.data.service', {
        '../../models/pupil-feedback': PupilFeedback
      })
    })

    it('makes the expected calls', async (done) => {
      await service.create({test: 'property'})
      expect(mock.verify()).toBe(true)
      done()
    })
  })
})
