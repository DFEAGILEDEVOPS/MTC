'use strict'

const sqlService = require('../../../../services/data-access/sql.service')
const sqlModifyResponse = require('../../mocks/sql-modify-response')
const sut = require('../../../../services/data-access/admin-logon-event.data.service')

describe('admin-logon-event.data.service', () => {
  describe('#sqlCreate', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'create').mockResolvedValue(sqlModifyResponse)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('makes the expected calls', async () => {
      const data = { test: 'property' }
      await sut.sqlCreate(data)
      expect(sqlService.create).toHaveBeenCalledWith('[adminLogonEvent]', data)
    })
  })
})
