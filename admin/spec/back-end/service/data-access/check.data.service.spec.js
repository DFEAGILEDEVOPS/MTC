'use strict'

const checkMock = require('../../mocks/check')
const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/check.data.service')

describe('check.data.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#sqlFindOneByCheckCode', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue(checkMock)
    })

    test('makes the expected calls', async () => {
      await sut.sqlFindOneByCheckCode('mock-check-code')
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })

  describe('#sqlFindLatestCheck', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue(checkMock)
    })

    test('should makes the expected call', async () => {
      await sut.sqlFindLatestCheck(1234)
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })

  describe('#sqlFindFullyPopulated', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue(checkMock)
    })

    test('makes the expected calls', async () => {
      await sut.sqlFindFullyPopulated({ testCriteria: 'someValue' })
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })

  describe('#sqlFindNumberOfChecksStartedByPupil', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue([{
        cnt: 5
      }])
    })

    test('makes the expected calls', async () => {
      await sut.sqlFindNumberOfChecksStartedByPupil(1234)
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })
})
