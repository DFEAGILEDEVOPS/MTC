'use strict'

const sqlService = require('../../../../services/data-access/sql.service')
const sqlMockResponse = require('../../mocks/sql-modify-response')
const hdfMock = require('../../mocks/sql-hdf.js')
const service = require('../../../../services/data-access/headteacher-declaration.data.service')

describe('headteacher-declaration.data.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#sqlCreate', () => {
    test('calls sqlService', async () => {
      jest.spyOn(sqlService, 'query').mockResolvedValue(sqlMockResponse)
      await service.sqlCreate({ prop: 'value' })
      expect(sqlService.query).toHaveBeenCalled()
    })
  })

  describe('#sqlFindLatestHdfBySchoolId', () => {
    test('calls the sqlService', async () => {
      jest.spyOn(sqlService, 'query').mockReturnValue([hdfMock])
      const result = await service.sqlFindLatestHdfBySchoolId(999)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof result).toBe('object')
    })
  })

  describe('#findHdfForCheck', () => {
    const dfeNumber = 9991999

    test('calls sqlService.query to find the hdf', async () => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([hdfMock])
      await service.sqlFindHdfForCheck(dfeNumber, 1)
      expect(sqlService.query).toHaveBeenCalled()
    })

    test('returns the hdf as an object', async () => {
      jest.spyOn(sqlService, 'query').mockReturnValue([hdfMock])
      const res = await service.sqlFindHdfForCheck(dfeNumber, 1)
      expect(typeof res).toBe('object')
    })
  })
})
