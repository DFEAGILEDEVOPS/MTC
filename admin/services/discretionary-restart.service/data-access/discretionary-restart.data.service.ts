const sqlService = require('../../data-access/sql.service')

export class DiscretionaryRestartDataService {
  public static async sqlGrantDiscretionaryRestart (pupilSlug: string):Promise<void> {
    const sql = `
      UPDATE [mtc_admin].[pupil]
      SET isDiscretionaryRestartAvailable = 1
      WHERE restartAvailable = 0
      AND urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: pupilSlug, type: sqlService.TYPES.UniqueIdentifier }
    ]
    return sqlService.modify(sql, params)
  }

  public static async sqlRevokeDiscretionaryRestart (pupilSlug: string):Promise<void> {
    const sql = `
      UPDATE [mtc_admin].[pupil]
      SET isDiscretionaryRestartAvailable = 0
      WHERE urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: pupilSlug, type: sqlService.TYPES.UniqueIdentifier }
    ]
    return sqlService.modify(sql, params)
  }
}
