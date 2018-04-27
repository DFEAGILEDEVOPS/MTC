'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const schoolMock = require('../../mocks/school')
const sqlService = require('../../../services/data-access/sql.service')

describe('school.data.service', () => {
  let service

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
})
