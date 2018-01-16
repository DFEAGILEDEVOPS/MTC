'use strict'

/* global describe, it, spyOn, expect */

const sqlService = require('../../../services/data-access/sql.service')
const sqlMockResponse = require('../../mocks/sql-modify-response')
const hdfMock = require('../../mocks/sql-hdf.js')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowMock = { id: 1 }

const controller = require('../../../services/data-access/headteacher-declaration.data.service')

describe('headteacher-declaration.data.service', () => {
  describe('#sqlCreate', () => {
    it('calls sqlService', async () => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve(sqlMockResponse))
      controller.sqlCreate({ prop: 'value' })
      expect(sqlService.create).toHaveBeenCalled()
    })
  })

  describe('#sqlFindLatestHdfBySchoolId', () => {
    it('calls the sqlService', async () => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      const result = await controller.sqlFindLatestHdfBySchoolId(999)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof result).toBe('object')
    })
  })

  describe('#findCurrentHdfForSchool', () => {
    const dfeNumber = 9991999

    it('finds the current check window', async () => {
      spyOn(checkWindowDataService, 'sqlFindCurrentCheckWindow').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      await controller.findCurrentHdfForSchool(dfeNumber)
      expect(checkWindowDataService.sqlFindCurrentCheckWindow).toHaveBeenCalled()
    })

    it('returns undefined if the current check window is not found', async () => {
      spyOn(checkWindowDataService, 'sqlFindCurrentCheckWindow').and.returnValue(Promise.resolve(undefined))
      const res = await controller.findCurrentHdfForSchool(dfeNumber)
      expect(res).toBeUndefined()
    })

    it('calls sqlService.query to find the hdf', async () => {
      spyOn(checkWindowDataService, 'sqlFindCurrentCheckWindow').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      await controller.findCurrentHdfForSchool(dfeNumber)
      expect(sqlService.query).toHaveBeenCalled()
    })

    it('returns the hdf as an object', async () => {
      spyOn(checkWindowDataService, 'sqlFindCurrentCheckWindow').and.returnValue(Promise.resolve(checkWindowMock))
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      const res = await controller.findCurrentHdfForSchool(dfeNumber)
      expect(typeof res).toBe('object')
    })
  })
})
