'use strict'
/* global describe expect it spyOn */

const sqlService = require('../../../services/data-access/sql.service')
const attendanceCodeDataService = require('../../../services/data-access/attendance-code.data.service')
const attendanceCodesMock = require('../../mocks/attendance-codes')

describe('attendanceCodeDataService: ', () => {
  describe('#sqlFindStatusCodes', () => {
    it('calls sqlService.query', async () => {
      spyOn(sqlService, 'query').and.returnValue(Promise.resolve(attendanceCodesMock))
      await attendanceCodeDataService.sqlFindStatusCodes()
      expect(sqlService.query).toHaveBeenCalled()
    })
  })
})
