import { type ISqlService, SqlService } from '../../sql/sql.service'

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
        INSERT INTO mtc_admin.pupilFeedback
          (pupil_id, school_id, check_id, satisfactionRating)
        VALUES
          (@pupilId, @schoolId, @checkId, @satisfactionRating)
    `
    await this.sqlService.modify(insertSql, [])
    // TODO infer check id, pupil id and school ids via sql
    // TODO remove partition and row keys, make sql insert statement instead
    /*     const entity = {
      PartitionKey: message.checkCode,
      RowKey: uuidv4(),
      checkCode: message.checkCode,
      inputType: message.inputType,
      satisfactionRating: message.satisfactionRating
    }
    const sql = `INSERT INTO feedback (checkCode, inputType, satisfactionRating) VALUES (?, ?, ?)`
    const params: ISqlParameter[] = []
    await this.sqlService.modify(sql, params) */
    // TODO insert entity into sql table
  }
}
