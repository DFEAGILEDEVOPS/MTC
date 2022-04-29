import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export class ServiceManagerPupilDataService {

  static async findPupilByUpn (upn: string): Promise<any> {
    const sql = `
      SELECT p.foreName, p.lastName, p.dateOfBirth,
        s.name as [schoolName], s.urn, s.dfeNumber,
        p.urlSlug
      FROM mtc_admin.pupil p
      INNER JOIN mtc_admin.school s ON s.id = p.school_id
      WHERE upn = @upn`
    const params = [
      {
        name: 'upn',
        value: upn,
        type: TYPES.NVarChar
      }
    ]
    return await sqlService.readonlyQuery(sql, params)
  }
}
