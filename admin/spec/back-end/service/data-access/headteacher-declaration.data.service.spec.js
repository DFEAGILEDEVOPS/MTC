'use strict'

/* global describe, it, spyOn, expect */

const sqlService = require('../../../../services/data-access/sql.service')
const sqlMockResponse = require('../../mocks/sql-modify-response')
const hdfMock = require('../../mocks/sql-hdf.js')
const service = require('../../../../services/data-access/headteacher-declaration.data.service')

describe('headteacher-declaration.data.service', () => {
  describe('#sqlCreate', () => {
    it('calls sqlService', async () => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve(sqlMockResponse))
      await service.sqlCreate({ prop: 'value' })
      expect(sqlService.create).toHaveBeenCalled()
    })
  })

  describe('#sqlFindLatestHdfBySchoolId', () => {
    it('calls the sqlService', async () => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      const result = await service.sqlFindLatestHdfBySchoolId(999)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof result).toBe('object')
    })
  })

  describe('#findHdfForCheck', () => {
    const dfeNumber = 9991999

    it('calls sqlService.query to find the hdf', async () => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      await service.sqlFindHdfForCheck(dfeNumber, 1)
      expect(sqlService.query).toHaveBeenCalled()
    })

    it('returns the hdf as an object', async () => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      const res = await service.sqlFindHdfForCheck(dfeNumber, 1)
      expect(typeof res).toBe('object')
    })
  })
})
