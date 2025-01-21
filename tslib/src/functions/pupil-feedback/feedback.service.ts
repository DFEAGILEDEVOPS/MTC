import { TYPES } from 'mssql'
import { type ISqlParameter, type ISqlService, SqlService } from '../../sql/sql.service'

export interface IPupilFeedbackMessage {
  version: number
  checkCode?: string
  feedback?: string
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
    if (message.checkCode === undefined || message.checkCode === '') {
      throw new Error('checkCode is required')
    }
    if (message.feedback === undefined || message.feedback === '') {
      throw new Error('feedback is required')
    }
    const insertSql = `
    DECLARE @checkId INT
    DECLARE @pupilId INT
    DECLARE @schoolId INT

        -- look up pupil_id, school_id and check_id using the check code
        SELECT
          @checkId = chk.id,
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
          (pupil_id, school_id, check_id, feedback)
        VALUES
          (@pupilId, @schoolId, @checkId, @feedback)
    `
    const params: ISqlParameter[] = [
      {
        name: 'checkCode',
        type: TYPES.UniqueIdentifier,
        value: message.checkCode
      },
      {
        name: 'feedback',
        type: TYPES.NVarChar(255),
        value: message.feedback
      }
    ]
    await this.sqlService.modify(insertSql, params)
  }
}
