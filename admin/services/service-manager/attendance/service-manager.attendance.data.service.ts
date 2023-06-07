import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export class ServiceManagerAttendanceDataService {
  static async getAttendanceCodes (): Promise<AttendanceCode[]> {
    const sql = `
      SELECT code, reason, [order], visible
      FROM mtc_admin.attendanceCode
      WHERE isPrivileged = 0
      ORDER BY [order]`
    return sqlService.readonlyQuery(sql)
  }

  static async setVisibility (attendanceCodes: AttendanceCodeVisibility[]): Promise<void> {
    const updates = new Array<string>()
    const params = new Array<any>()
    for (let i = 0; i < attendanceCodes.length; i++) {
      const attendanceCode = attendanceCodes[i]
      updates.push(`UPDATE mtc_admin.attendanceCode SET visible = @visible${i} WHERE code = @code${i}`)
      params.push({
        name: `visible${i}`,
        type: TYPES.Bit,
        value: attendanceCode.visible
      })
      params.push({
        name: `code${i}`,
        type: TYPES.Char(5),
        value: attendanceCode.code
      })
    }
    await sqlService.modifyWithTransaction(updates.join('\n'), params)
  }
}

export interface AttendanceCode {
  code: string
  reason: string
  order: number
  visible: boolean
}

export interface AttendanceCodeVisibility {
  code: string
  visible: boolean
}
