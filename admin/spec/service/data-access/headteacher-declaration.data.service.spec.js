'use strict'

/* global describe, it, spyOn, expect */

const sqlService = require('../../../services/data-access/sql.service')
const sqlMockResponse = require('../../mocks/sql-modify-response')
const hdfMock = require('../../mocks/sql-hdf.js')
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
    it('calls the sqlService', () => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([hdfMock]))
      const result = controller.sqlFindLatestHdfBySchoolId(999)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof result).toBe('object')
    })
  })
})
