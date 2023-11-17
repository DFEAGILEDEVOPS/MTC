const sqlService = require('../../data-access/sql.service')

export class DiscretionaryRestartDataService {
  public static async sqlGrantDiscretionaryRestart (pupilSlug: string, userId: number): Promise<void> {
    const sql = `
      UPDATE [mtc_admin].[pupil]
      SET isDiscretionaryRestartAvailable = 1,
          lastModifiedBy_userId = @userId
      WHERE restartAvailable = 0
      AND urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: pupilSlug, type: sqlService.TYPES.UniqueIdentifier },
      { name: 'userId', value: userId, type: sqlService.TYPES.Int }
    ]
    return sqlService.modify(sql, params)
  }

  public static async sqlRevokeDiscretionaryRestart (pupilSlug: string, userId: number): Promise<void> {
    const sql = `
      UPDATE [mtc_admin].[pupil]
      SET isDiscretionaryRestartAvailable = 0,
          lastModifiedBy_userId = @userId
      WHERE urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: pupilSlug, type: sqlService.TYPES.UniqueIdentifier },
      { name: 'userId', value: userId, type: sqlService.TYPES.Int }
    ]
    return sqlService.modify(sql, params)
  }
}
