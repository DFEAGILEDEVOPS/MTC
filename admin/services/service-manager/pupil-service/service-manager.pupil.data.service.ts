import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export interface IServiceManagerPupilDataService {
  findPupilByUpn (upn: string): Promise<any>
}

export class ServiceManagerPupilDataService implements IServiceManagerPupilDataService {

  async findPupilByUpn (upn: string): Promise<any> {
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
