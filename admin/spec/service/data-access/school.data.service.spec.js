'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')
const moment = require('moment')

const School = require('../../../models/school')
const schoolMock = require('../../mocks/school')
const sqlService = require('../../../services/data-access/sql.service')
const responseMock = require('../../mocks/sql-modify-response')

describe('school.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#findOne', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(School).expects('findOne').chain('lean').chain('exec').resolves(schoolMock)
      service = proxyquire('../../../services/data-access/school.data.service', {
        '../../models/school': School
      })
    })

    it('calls the model', () => {
      service.findOne({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#update', () => {
    let school
    let mock

    beforeEach(() => {
      school = Object.assign({}, schoolMock)
      mock = sandbox.mock(School).expects('updateOne').chain('exec').resolves({})
      service = proxyquire('../../../services/data-access/school.data.service', {
        '../../models/school': School
      })
    })

    it('calls the model', () => {
      service.update(school._id, { name: school.name })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#find', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(School).expects('find').chain('lean').chain('exec').resolves(schoolMock)
      service = proxyquire('../../../services/data-access/school.data.service', {
        '../../models/school': School
      })
    })

    it('calls the model', () => {
      service.find({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#sqlFindOneBySchoolPin', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([schoolMock]))
      service = proxyquire('../../../services/data-access/school.data.service', {
        './sql.service': sqlService
      })
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindOneBySchoolPin('9999z')
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByDfeNumber', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([schoolMock]))
      service = proxyquire('../../../services/data-access/school.data.service', {
        './sql.service': sqlService
      })
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindOneByDfeNumber(12345678)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlUpdate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'update').and.returnValue(Promise.resolve(responseMock))
      service = proxyquire('../../../services/data-access/school.data.service', {
        './sql.service': sqlService
      })
    })

    it('it makes the expected calls', async () => {
      const update = {
        id: 42,
        pin: '3333a',
        pinExpiresAt: moment().add(4, 'hours')
      }
      await service.sqlUpdate(update)
      expect(sqlService.update).toHaveBeenCalled()
    })
  })
})
