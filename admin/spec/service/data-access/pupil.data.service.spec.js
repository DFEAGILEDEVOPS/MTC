'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
require('sinon-mongoose')

const Pupil = require('../../../models/pupil')
const pupilMock = require('../../mocks/pupil')

describe('pupil.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('insertMany', () => {
    let pupil1
    let pupil2
    beforeEach(() => {
      const pupil1 = pupilMock
      const pupil2 = pupilMock
      pupil2.id = '595cd5416e5ca13e48ed2520'
      pupil2.pin = 'f55sg'
      sandbox.mock(Pupil).expects('insertMany').resolves([pupil1, pupil2])
      proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('returns a list of inserted pupils', async () => {
      const savedPupils = await pupilDataService.insertMany([pupil1, pupil2])
      expect(savedPupils.length).toBe(2)
    })
  })

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
