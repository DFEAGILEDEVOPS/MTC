'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sqlService = require('../../../services/data-access/sql.service')

describe('role.data.service', () => {
  let service

  describe('#sqlFindOneById', () => {
    beforeEach(() => {
      spyOn(sqlService, 'findOneById').and.returnValue(Promise.resolve({userMock: 'true'}))
      service = proxyquire('../../../services/data-access/role.data.service', {
        './sql.service': sqlService
      })
      return service
    })

    it('makes the expected calls', async (done) => {
      const id = 42
      await service.sqlFindOneById(id)
      expect(sqlService.findOneById).toHaveBeenCalledWith('[role]', id)
      done()
    })
  })
})
