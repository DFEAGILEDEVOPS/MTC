'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sqlService = require('../../../services/data-access/sql.service')
const sqlModifyResponse = require('../../mocks/sql-modify-response')

describe('admin-logon-event.data.service', () => {
  let service

  describe('#sqlCreate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve(sqlModifyResponse))
      service = proxyquire('../../../services/data-access/admin-logon-event.data.service', {
        './sql.service': sqlService
      })
      return service
    })

    it('makes the expected calls', async (done) => {
      const data = {test: 'property'}
      await service.sqlCreate(data)
      expect(sqlService.create).toHaveBeenCalledWith('[adminLogonEvent]', data)
      done()
    })
  })
})
