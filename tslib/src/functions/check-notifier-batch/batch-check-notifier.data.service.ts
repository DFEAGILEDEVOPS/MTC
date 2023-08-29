import { SqlService, type ITransactionRequest, type ISqlParameter } from '../../sql/sql.service'
import * as mssql from 'mssql'
import { isNonEmptyArray } from 'ramda-adjunct'

export interface IBatchCheckNotifierDataService {
  createCheckCompleteRequest (checkCode: string): Promise<ITransactionRequest[]>

  createProcessingFailedRequest (checkCode: string): ITransactionRequest

  createCheckReceivedRequest (checkCode: string): ITransactionRequest

  executeRequestsInTransaction (requests: ITransactionRequest[]): Promise<void>
}

export class BatchCheckNotifierDataService implements IBatchCheckNotifierDataService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async createCheckCompleteRequest (checkCode: string): Promise<ITransactionRequest[]> {
    const checkCodeParam: ISqlParameter = {
      type: mssql.UniqueIdentifier,
      name: 'checkCode',
      value: checkCode
    }
    const checkRequest: ITransactionRequest = {
      sql: `UPDATE [mtc_admin].[check]
               SET complete = 1,
                   completedAt = GETUTCDATE(),
                   processingFailed = 0
             WHERE checkCode = @checkCode
               AND complete = 0`,
      params: [
        checkCodeParam
      ]
    }

    // The array of SQL statements we will return to the caller.
    const sqlStatements: ITransactionRequest[] = []

    // We always want to complete the check that we just received the payload for, so add it to the return statements
    sqlStatements.push(checkRequest)

    // Pupil Verification: we need to find the check id of the currentCheckId for the pupil, so that IF this checkCode that is now complete,
    // and it is the same as the currentCheckId THEN we can consider setting the pupil to checkComplete as long as the other checks succeed.
    const checkCodeSql: string = `
      SELECT 
        id
      FROM
         mtc_admin.[check] 
      WHERE
        checkCode = @checkCode
    `
    const checkData = await this.sqlService.query(checkCodeSql, [checkCodeParam])
    let checkIdToComplete: undefined | number
    if (isNonEmptyArray(checkData)) {
      checkIdToComplete = checkData[0]?.id
    }

    const pupilSql: string = `
        SELECT 
            p.attendanceCode, 
            p.restartAvailable,
            p.currentCheckId
        FROM 
            mtc_admin.pupil p JOIN mtc_admin.[check] c on (c.pupil_id = p.id)
        WHERE 
            c.checkCode = @checkCode`

    const pupilData = await this.sqlService.query(pupilSql, [checkCodeParam])
    let pupil: undefined | { attendanceCode: string, restartAvailable: boolean, currentCheckId: number }
    if (isNonEmptyArray(pupilData)) {
      pupil = pupilData[0]
    }

    // Only set the pupil.checkComplete flag if the pupil is still set to the same check, and a restart has not been given, and the
    // pupil has not been marked as not attending.
    if (pupil !== undefined &&
      pupil.attendanceCode === null &&
      !pupil.restartAvailable &&
      checkIdToComplete !== undefined &&
      pupil.currentCheckId === checkIdToComplete) {
      const pupilRequest: ITransactionRequest = {
        sql: `UPDATE [mtc_admin].[pupil]
               SET checkComplete = 1
              FROM [mtc_admin].[pupil] p
                   INNER JOIN [mtc_admin].[check] c ON p.id = c.pupil_id
             WHERE c.checkCode = @checkCode
               AND checkComplete = 0`,
        params: [
          checkCodeParam
        ]
      }
      sqlStatements.push(pupilRequest)
    }
    return sqlStatements
  }

  createProcessingFailedRequest (checkCode: string): ITransactionRequest {
    return {
      sql: `UPDATE [mtc_admin].[check]
               SET processingFailed = 1
             WHERE checkCode = @checkCode
               AND processingFailed = 0`,
      params: [
        {
          type: mssql.UniqueIdentifier,
          name: 'checkCode',
          value: checkCode
        }
      ]
    }
  }

  createCheckReceivedRequest (checkCode: string): ITransactionRequest {
    return {
      params: [{
        type: mssql.UniqueIdentifier,
        name: 'checkCode',
        value: checkCode
      }],
      sql: `UPDATE [mtc_admin].[check]
               SET received = 1,
                   receivedByServerAt = GETUTCDATE()
             WHERE checkCode = @checkCode
               AND received = 0
               AND receivedByServerAt IS NULL
      `
    }
  }

  async executeRequestsInTransaction (requests: ITransactionRequest[]): Promise<void> {
    return this.sqlService.modifyWithTransaction(requests)
  }
}
