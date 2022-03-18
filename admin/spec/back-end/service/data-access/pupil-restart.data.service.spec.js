'use strict'
/* global describe, beforeEach, test, expect, jest, afterEach */

const pupilRestartMock = require('../../mocks/pupil-restart')
const restartCodesMock = require('../../mocks/restart-codes')
const pupilMock = require('../../mocks/pupil')
const sqlService = require('../../../../services/data-access/sql.service')

describe('pupil-restart.data.service', () => {
  let service

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#sqlFindLatestRestart', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue([pupilRestartMock])
      service = require('../../../../services/data-access/pupil-restart.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindLatestRestart(pupilMock._id)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindRestartCodes', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'query').mockResolvedValue(restartCodesMock)
      service = require('../../../../services/data-access/pupil-restart.data.service')
    })

    test('it makes the expected calls', async () => {
      const res = await service.sqlFindRestartCodes()
      expect(sqlService.query).toHaveBeenCalled()
      expect(Array.isArray(res)).toBe(true)
    })
  })

  describe('#sqlMarkRestartAsDeleted', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'modifyWithTransactionAndResponse').mockResolvedValue({ rowsModified: 1 })
      service = require('../../../../services/data-access/pupil-restart.data.service')
    })

    test('it makes the expected calls', async () => {
      await service.sqlMarkRestartAsDeleted(pupilMock._id, 'some_id')
      expect(sqlService.modifyWithTransactionAndResponse).toHaveBeenCalled()
    })
  })
})
