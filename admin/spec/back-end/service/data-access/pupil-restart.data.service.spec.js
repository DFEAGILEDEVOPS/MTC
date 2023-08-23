'use strict'
/* global describe, beforeEach, test, expect, jest, afterEach */

const pupilMock = require('../../mocks/pupil')
const sqlService = require('../../../../services/data-access/sql.service')

describe('pupil-restart.data.service', () => {
  let service

  afterEach(() => {
    jest.restoreAllMocks()
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
