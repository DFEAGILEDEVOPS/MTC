'use strict'

/* global describe beforeEach it expect spyOn */

const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/setting.data.service')

describe('pupil.data.service', () => {
  describe('#sqlUpdate', () => {
    beforeEach(() => {
      spyOn(sqlService, 'modify').and.returnValue({ rowsModified: 1 })
    })

    it('calls the model', async () => {
      const loadingTimeLimit = 10
      const questionTimeLimit = 20
      const checkTimeLimit = 30
      await sut.sqlUpdate(loadingTimeLimit, questionTimeLimit, checkTimeLimit)
      expect(sqlService.modify).toHaveBeenCalled()
    })
  })
})
