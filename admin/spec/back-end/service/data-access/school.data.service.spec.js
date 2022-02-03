'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const schoolMock = require('../../mocks/school')
const sqlService = require('../../../../services/data-access/sql.service')
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
})
