'use strict'
/* global describe expect it spyOn */

const sqlService = require('../../../../services/data-access/sql.service')
const attendanceCodeDataService = require('../../../../services/data-access/attendance-code.data.service')
const attendanceCodesMock = require('../../mocks/attendance-codes')

describe('attendanceCodeDataService: ', () => {
  describe('#sqlFindAttendanceCodes', () => {
    it('calls sqlService.readonlyQuery', async () => {
      spyOn(sqlService, 'readonlyQuery').and.returnValue(Promise.resolve(attendanceCodesMock))
      await attendanceCodeDataService.sqlFindAttendanceCodes()
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })
})
