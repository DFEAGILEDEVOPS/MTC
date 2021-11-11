'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const checkMock = require('../../mocks/check')
const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/check.data.service')

describe('check.data.service', () => {
  describe('#sqlFindOneByCheckCode', () => {
    beforeEach(() => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue(checkMock)
    })

    it('makes the expected calls', async () => {
      await sut.sqlFindOneByCheckCode('mock-check-code')
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })

  describe('#sqlFindLatestCheck', () => {
    beforeEach(() => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue(checkMock)
    })

    it('should makes the expected call', async () => {
      await sut.sqlFindLatestCheck(1234)
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })

  describe('#sqlFindFullyPopulated', () => {
    beforeEach(() => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue(checkMock)
    })

    it('makes the expected calls', async () => {
      await sut.sqlFindFullyPopulated({ testCriteria: 'someValue' })
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })

  describe('#sqlFindNumberOfChecksStartedByPupil', () => {
    beforeEach(() => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue([{
        cnt: 5
      }])
    })

    it('makes the expected calls', async () => {
      await sut.sqlFindNumberOfChecksStartedByPupil(1234)
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })
})
