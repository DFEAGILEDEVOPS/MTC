'use strict'

const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/user.data.service')

describe('user.data.service', () => {
  describe('#sqlFindOneByIdentifier', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([{ userMock: 'true' }])
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('makes the expected calls', async () => {
      const identifier = 'teacher42'
      const res = await sut.sqlFindOneByIdentifier(identifier)
      expect(sqlService.query).toHaveBeenCalled()
      // as this is a find one - we expect an object back, not an array of objects
      expect(typeof res).toBe('object')
    })
  })
})
