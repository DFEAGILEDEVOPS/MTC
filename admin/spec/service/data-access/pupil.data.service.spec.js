'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
require('sinon-mongoose')

const Pupil = require('../../../models/pupil')
const School = require('../../../models/school')
const pupilMock = require('../../mocks/pupil')
const schoolMock = require('../../mocks/school')

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
      sandbox.mock(Pupil).expects('insertMany').resolves([ pupil1, pupil2 ])
      proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('returns a list of inserted pupils', async () => {
      const savedPupils = await pupilDataService.insertMany([ pupil1, pupil2 ])
      expect(savedPupils.length).toBe(2)
    })
  })

  describe('#findOne', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Pupil).expects('findOne').chain('populate').chain('lean').chain('exec').resolves(pupilMock)
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('calls the model', () => {
      service.findOne({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#update', () => {
    let mock
    beforeEach(() => {
      mock = sandbox.mock(Pupil).expects('updateOne').returns(pupilMock)
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('makes the expected calls', () => {
      service.update(1, { $set: { 'some': 'criteria' } })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#getPupils', () => {
    let mockPupil
    let mockSchool
    beforeEach(() => {
      const pupil1 = pupilMock
      const pupil2 = pupilMock
      mockPupil = sandbox.mock(School).expects('findOne').chain('lean').chain('exec').returns(schoolMock)
      mockSchool = sandbox.mock(Pupil).expects('getPupils').chain('exec').returns([ pupil1, pupil2 ])
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil,
        '../../models/school': School
      })
    })

    it('has a get Pupils method', () => {
      expect(typeof service.getPupils).toBe('function')
    })

    it('returns a school data object and a list of pupils', async () => {
      const data = await pupilDataService.getPupils(schoolMock._id)
      expect(data.schoolData._id).toBe(9991001)
      expect(data.pupils.length).toBe(2)
      expect(mockPupil.verify()).toBe(true)
      expect(mockSchool.verify()).toBe(true)
    })
  })

  describe('#getSortedPupils', () => {
    let mockPupil
    beforeEach(() => {
      const pupil1 = pupilMock
      const pupil2 = pupilMock
      mockPupil = sandbox.mock(Pupil).expects('find').chain('sort').chain('lean').chain('exec').returns([ pupil1, pupil2 ])
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil,
        '../../models/school': School
      })
    })
    it('returns sorted pupils', async () => {
      const sortField = 'lastName'
      const sortDirection = 'asc'
      const pupils = await pupilDataService.getSortedPupils(schoolMock._id, sortField, sortDirection)
      expect(pupils.length).toBe(2)
      expect(mockPupil.verify()).toBe(true)
    })
  })
  describe('#updateMultiple', () => {
    let pupil1
    let pupil2
    let mockPupil
    beforeEach(() => {
      pupil1 = pupilMock
      pupil1.pin = 'ggd4d'
      pupil2 = Object.assign({}, pupilMock)
      pupil2._id = '595cd5416e5ca13e48ed2520'
      pupil2.pin = 'gfd4d'
      mockPupil = sandbox.mock(Pupil).expects('updateOne').twice()
        .returns({ n: 1, nModified: 1, ok: 1 })
      service = proxyquire('../../../services/data-access/pupil.data.service', {
        '../../models/pupil': Pupil,
        '../../models/school': School
      })
    })
    it('returns saved pupils list', async () => {
      const savedPupils = await pupilDataService.updateMultiple([ pupil1, pupil2 ])
      expect(savedPupils.length).toBe(2)
      expect(mockPupil.verify()).toBe(true)
    })
  })
})
