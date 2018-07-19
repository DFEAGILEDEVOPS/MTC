'use strict'

/* global describe expect it spyOn */
const sqlService = require('../../../../services/data-access/sql.service')
const service = require('../../../../services/data-access/pupil-status-code.data.service')

describe('pupil-status-code.data.service', () => {
  describe('#sqlFindStatusCodes', () => {
    it('calls sqlService', async () => {
      spyOn(sqlService, 'query')
      await service.sqlFindStatusCodes()
      expect(sqlService.query).toHaveBeenCalled()
    })
  })
})
