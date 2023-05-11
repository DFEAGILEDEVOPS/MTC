import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export class ServiceManagerAttendanceDataService {
  static async getAttendanceCodes (): Promise<AttendanceCode[]> {
    const sql = `
      SELECT id, code, reason, [order], visible
      FROM mtc_admin.attendanceCode
      WHERE isPrivileged = 0
      ORDER BY [order]`
    return sqlService.readonlyQuery(sql)
  }

  static async setVisibility (attendanceCode: string, visible: boolean): Promise<void> {
    const sql = `
      UPDATE mtc_admin.attendanceCode
      SET visible = @visible
      WHERE code = @attendanceCode`
    const params = [
      {
        name: 'attendanceCode',
        value: attendanceCode,
        type: TYPES.Char(5)
      },
      {
        name: 'visible',
        value: visible,
        type: TYPES.Bit
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
