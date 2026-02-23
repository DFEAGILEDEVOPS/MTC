'use strict'

const schoolMock = require('../../mocks/school')
const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/school.data.service')

describe('school.data.service', () => {
  describe('#sqlFindOneBySchoolPin', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue([schoolMock])
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('it makes the expected calls', async () => {
      const res = await sut.sqlFindOneBySchoolPin('9999z')
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindOneByDfeNumber', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue([schoolMock])
    })

    test('it makes the expected calls', async () => {
      const res = await sut.sqlFindOneByDfeNumber(12345678)
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })
})
