'use strict'

const sqlService = require('../../../../services/data-access/sql.service')
const sut = require('../../../../services/data-access/setting.data.service')

describe('pupil.data.service', () => {
  describe('#sqlUpdate', () => {
    beforeEach(() => {
      jest.spyOn(sqlService, 'modify').mockResolvedValue({ rowsModified: 1 })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('calls the model', async () => {
      const loadingTimeLimit = 10
      const questionTimeLimit = 20
      const checkTimeLimit = 30
      await sut.sqlUpdate(loadingTimeLimit, questionTimeLimit, checkTimeLimit)
      expect(sqlService.modify).toHaveBeenCalled()
    })
  })
})
