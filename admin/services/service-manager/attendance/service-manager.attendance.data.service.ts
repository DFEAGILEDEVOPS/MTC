import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export class ServiceManagerAttendanceDataService {
  static async getAttendanceCodes (): Promise<AttendanceCode[]> {
    const sql = `
      SELECT id, code, reason, [order], visible
      FROM mtc_admin.attendanceCode
      ORDER BY [order]`
    return sqlService.readonlyQuery(sql)
  }

  static async toggleVisibility (attendanceCodeId: number): Promise<void> {
    const sql = `
      UPDATE mtc_admin.attendanceCode
      SET visible = ~visible
      WHERE id = @attendanceCodeId`
    const params = [
      {
        name: 'attendanceCodeId',
        value: attendanceCodeId,
        type: TYPES.Int
      }
    ]
    await sqlService.query(sql, params)
  }
}

export interface AttendanceCode {
  id: number
  code: string
  reason: string
  order: number
  visible: boolean
}
