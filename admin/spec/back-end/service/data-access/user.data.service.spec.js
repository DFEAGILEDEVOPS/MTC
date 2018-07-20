'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sqlService = require('../../../../services/data-access/sql.service')

describe('user.data.service', () => {
  let service

  describe('#sqlFindOneByIdentifier', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([ { userMock: 'true' } ]))
      service = proxyquire('../../../../services/data-access/user.data.service', {
        './sql.service': sqlService
      })
      return service
    })

    it('makes the expected calls', async (done) => {
      const identifier = 'teacher42'
      const res = await service.sqlFindOneByIdentifier(identifier)
      expect(sqlService.query).toHaveBeenCalled()
      // as this is a find one - we expect an object back, not an array of objects
      expect(typeof res).toBe('object')
      done()
    })
  })
})
