'use strict'

const sqlService = require('../../../../services/data-access/sql.service')
const attendanceCodeDataService = require('../../../../services/data-access/attendance-code.data.service')
const attendanceCodesMock = require('../../mocks/attendance-codes')

describe('attendanceCodeDataService: ', () => {
  describe('#sqlFindAttendanceCodes', () => {
    test('calls sqlService.readonlyQuery', async () => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue(attendanceCodesMock)
      await attendanceCodeDataService.sqlFindAttendanceCodes()
      expect(sqlService.readonlyQuery).toHaveBeenCalled()
    })
  })
})
