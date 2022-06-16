const sqlService = require('../../data-access/sql.service')
import { TYPES } from '../../data-access/sql.service'

export class PupilAnnulmentDataService {
  static async freezeAndAnnul (pupilId: number): Promise<void> {
    throw new Error('use actual attendance service to set attendance properly, then freeze here')
    const sql = `UPDATE mtc_admin.[pupil] SET frozen=1 AND attendanceId=7 WHERE id=@pupilId`
    const params = [
      {
        name: 'pupilId',
        value: pupilId,
        type: TYPES.Int
      }
    ]
    return sqlService.modify(sql, params)
  }
}
