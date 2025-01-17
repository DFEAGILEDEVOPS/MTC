import { type ISqlParameter, type ISqlService, SqlService } from '../../sql/sql.service'

export interface IPupilFeedbackMessage {
  version: number
  checkCode: string
  satisfactionRating: string
}

export class PupilFeedbackService {
  private readonly sqlService: ISqlService
  constructor (sqlService?: ISqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  async process (message: IPupilFeedbackMessage): Promise<void> {
    if (message.version !== 3) {
      throw new Error(`version:${message.version} unsupported`)
    }
    if (message.checkCode === '') {
      throw new Error('checkCode is required')
    }
    if (message.satisfactionRating === '') {
      throw new Error('satisfactionRating is required')
    }
    const insertSql = `
    DECLARE @checkId INT
    DECLARE @pupilId INT
    DECLARE @schoolId INT

        -- look up pupil_id, school_id and check_id using the check code
        SELECT
          @checkId = [check_id],
          @pupilId = chk.pupil_id,
          @schoolId = s.id
        FROM
          mtc_admin.[check] chk
        INNER JOIN
          mtc_admin.pupil p ON chk.pupil_id = p.id
        INNER JOIN
          mtc_admin.school s ON p.school_id = s.id
        WHERE
          chk.checkCode = @checkCode

        IF @checkId IS NULL THROW 50000, 'checkId not found', 1
        IF @pupilId IS NULL THROW 50000, 'pupilId not found', 1
        IF @schoolId IS NULL THROW 50000, 'schoolId not found', 1

        INSERT INTO mtc_admin.pupilFeedback
          (pupil_id, school_id, check_id, satisfactionRating)
        VALUES
          (@pupilId, @schoolId, @checkId, @satisfactionRating)
    `
    const params: ISqlParameter[] = [
      {
        name: 'checkCode',
        type: 'uniqueidentifier',
        value: message.checkCode
      },
      {
        name: 'satisfactionRating',
        type: 'NVarChar',
        value: message.satisfactionRating
      }
    ]
    await this.sqlService.modify(insertSql, params)
  }
}
