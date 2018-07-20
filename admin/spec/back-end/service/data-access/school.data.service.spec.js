'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const moment = require('moment')
const schoolMock = require('../../mocks/school')
const sqlService = require('../../../../services/data-access/sql.service')
const responseMock = require('../../mocks/sql-modify-response')

describe('school.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#sqlFindOneBySchoolPin', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([schoolMock]))
      service = proxyquire('../../../../services/data-access/school.data.service', {
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
      service = proxyquire('../../../../services/data-access/school.data.service', {
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
      service = proxyquire('../../../../services/data-access/school.data.service', {
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
