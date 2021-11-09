'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const moment = require('moment')
const schoolMock = require('../../mocks/school')
const sqlService = require('../../../../services/data-access/sql.service')
const redisCacheService = require('../../../../services/data-access/redis-cache.service')
const responseMock = require('../../mocks/sql-modify-response')
const sut = require('../../../../services/data-access/school.data.service')

describe('school.data.service', () => {
  describe('#sqlFindOneBySchoolPin', () => {
    beforeEach(() => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue(Promise.resolve([schoolMock]))
    })

    it('it makes the expected calls', async () => {
      const res = await sut.sqlFindOneBySchoolPin('9999z')
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByDfeNumber', () => {
    beforeEach(() => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue(Promise.resolve([schoolMock]))
    })

    it('it makes the expected calls', async () => {
      const res = await sut.sqlFindOneByDfeNumber(12345678)
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlUpdate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'update').and.returnValue(Promise.resolve(responseMock))
      spyOn(redisCacheService, 'drop').and.returnValue(true)
    })

    it('it makes the expected calls', async () => {
      const update = {
        id: 42,
        pin: '3333a',
        pinExpiresAt: moment().add(4, 'hours')
      }
      await sut.sqlUpdate(update)
      expect(sqlService.update).toHaveBeenCalled()
    })
  })
})
