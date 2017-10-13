'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Pupil = require('../../../models/pupil')
const pupilMock = require('../../mocks/pupil')

describe('pupil.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#findOne', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(Pupil).expects('findOne').chain('populate').chain('lean').chain('exec').resolves(pupilMock)
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('calls the model', () => {
      service.findOne({_id: 'some-id'})
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#update', () => {
    beforeEach(() => {
      sinon.mock(Pupil).expects('updateOne').returns(pupilMock)
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('has an update method', () => {
      expect(typeof service.update).toBe('function')
    })
  })
})
