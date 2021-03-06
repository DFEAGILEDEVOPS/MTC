'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const pupilRestartMock = require('../../mocks/pupil-restart')
const restartCodesMock = require('../../mocks/restart-codes')
const pupilMock = require('../../mocks/pupil')
const sqlService = require('../../../../services/data-access/sql.service')

describe('pupil-restart.data.service', () => {
  let service

  describe('#sqlFindLatestRestart', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve([pupilRestartMock]))
      service = require('../../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindLatestRestart(pupilMock._id)
      expect(sqlService.query).toHaveBeenCalled()
      expect(typeof res).toBe('object')
    })
  })

  describe('#sqlFindRestartCodes', () => {
    beforeEach(() => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve(restartCodesMock))
      service = require('../../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      const res = await service.sqlFindRestartCodes()
      expect(sqlService.query).toHaveBeenCalled()
      expect(Array.isArray(res)).toBe(true)
    })
  })

  describe('#sqlMarkRestartAsDeleted', () => {
    beforeEach(() => {
      spyOn(sqlService, 'modifyWithTransactionAndResponse').and.returnValue({ rowsModified: 1 })
      service = require('../../../../services/data-access/pupil-restart.data.service')
    })

    it('it makes the expected calls', async () => {
      await service.sqlMarkRestartAsDeleted(pupilMock._id, 'some_id')
      expect(sqlService.modifyWithTransactionAndResponse).toHaveBeenCalled()
    })
  })
})
