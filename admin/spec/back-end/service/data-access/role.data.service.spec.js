'use strict'

const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/role.data.service')

describe('role.data.service', () => {
  describe('#sqlFindOneById', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'findOneById').mockResolvedValue({ userMock: 'true' })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('makes the expected calls', async () => {
      const id = 42
      await sut.sqlFindOneById(id)
      expect(sqlService.findOneById).toHaveBeenCalledWith('[role]', id)
    })
  })
})
