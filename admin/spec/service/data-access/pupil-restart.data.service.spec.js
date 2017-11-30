'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const PupilRestarts = require('../../../models/pupil-restarts')
const pupilRestartMocks = require('../../mocks/pupil-restarts')

describe('pupil-restart.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(PupilRestarts.prototype).expects('save').resolves(pupilRestartMocks)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestarts
      })
    })

    it('calls the model', async (done) => {
      await service.create({ mock: 'object' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })
  describe('#count', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(PupilRestarts).expects('count').chain('exec').resolves(1)
      service = proxyquire('../../../services/data-access/pupil-restart.data.service', {
        '../../models/pupil-restarts': PupilRestarts
      })
    })

    it('counts docs in the db', async (done) => {
      await service.count({ searchCriteria: 'someValue' })
      expect(mock.verify()).toBe(true)
      done()
    })
  })
})
