'use strict'
/* global describe beforeEach it expect spyOn */

const sqlService = require('../../../../services/data-access/sql.service')
const sqlModifyResponse = require('../../mocks/sql-modify-response')
const sut = require('../../../../services/data-access/admin-logon-event.data.service')

describe('admin-logon-event.data.service', () => {
  describe('#sqlCreate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve(sqlModifyResponse))
    })

    it('makes the expected calls', async () => {
      const data = { test: 'property' }
      await sut.sqlCreate(data)
      expect(sqlService.create).toHaveBeenCalledWith('[adminLogonEvent]', data)
    })
  })
})
