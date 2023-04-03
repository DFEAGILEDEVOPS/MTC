import sqlService, { TYPES } from '../../../services/data-access/sql.service'

export class PupilFreezeDataService {
  /**
   * Set the pupil.frozen flag to make the pupil record read-only.
   */
  static async setFreezeFlag (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    const sql = `
    DECLARE @pupilId Int = (SELECT id from [mtc_admin].[pupil] where urlSlug = @pupilUrlSlug)

    IF @pupilId IS NULL
      THROW 51000, 'pupil not found', 1;

    IF @userId IS NULL
      THROW 51001, 'Current user not provided', 1;

    UPDATE
      mtc_admin.pupil
    SET
      frozen = 1,
      lastModifiedBy_userId = @userId
    WHERE
      id = @pupilId;
    `

    const params = [
      { name: 'pupilUrlSlug', value: pupilUrlSlug, type: TYPES.UniqueIdentifier },
      { name: 'userId', value: currentUserId, type: TYPES.Int }
    ]

    await sqlService.modifyWithTransaction(sql, params)
  }
}
