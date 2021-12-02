'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/role.data.service')

describe('role.data.service', () => {
  describe('#sqlFindOneById', () => {
    beforeEach(() => {
      spyOn(sqlService, 'findOneById').and.returnValue(Promise.resolve({ userMock: 'true' }))
    })

    it('makes the expected calls', async () => {
      const id = 42
      await sut.sqlFindOneById(id)
      expect(sqlService.findOneById).toHaveBeenCalledWith('[role]', id)
    })
  })
})
