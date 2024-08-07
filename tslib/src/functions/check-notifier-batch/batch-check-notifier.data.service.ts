import { SqlService, type ITransactionRequest, type ISqlParameter } from '../../sql/sql.service'
import * as mssql from 'mssql'
import { isNonEmptyArray } from 'ramda-adjunct'
import { ConsoleLogger, type ILogger } from '../../common/logger'

export interface IBatchCheckNotifierDataService {
  createCheckCompleteRequest (checkCode: string): Promise<ITransactionRequest[]>
  createProcessingFailedRequest (checkCode: string): ITransactionRequest
  createCheckReceivedRequest (checkCode: string): ITransactionRequest
  executeRequestsInTransaction (requests: ITransactionRequest[]): Promise<void>
}

export class BatchCheckNotifierDataService implements IBatchCheckNotifierDataService {
  private readonly sqlService: SqlService
  private readonly logService: ILogger
  private readonly serviceName = 'BatchCheckNotifierDataService'

  constructor (logger?: ILogger) {
    this.logService = logger ?? new ConsoleLogger()
    this.sqlService = new SqlService()
  }

  async createCheckCompleteRequest (checkCode: string): Promise<ITransactionRequest[]> {
    this.logService?.trace(`${this.serviceName}.checkCompleteRequest(): starting for checkCode [${checkCode}]`)
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
    this.logService.trace(`checkData: ${JSON.stringify(checkData)}`)
    let checkIdToComplete: undefined | number
    if (isNonEmptyArray(checkData)) {
      checkIdToComplete = checkData[0]?.id
      this.logService.trace(`checkIdToComplete: ${checkIdToComplete}`)
    }

    const pupilSql: string = `
        SELECT
            p.attendanceId,
            p.restartAvailable,
            p.currentCheckId
        FROM
            mtc_admin.pupil p JOIN mtc_admin.[check] c on (c.pupil_id = p.id)
        WHERE
            c.checkCode = @checkCode`

    let pupil: undefined | { attendanceId: number, restartAvailable: boolean, currentCheckId: number }
    try {
      const pupilData = await this.sqlService.query(pupilSql, [checkCodeParam])
      this.logService.trace(`pupilData: ${JSON.stringify(pupilData)}`)
      if (isNonEmptyArray(pupilData)) {
        pupil = pupilData[0]
      }
      this.logService.trace(`pupil: ${JSON.stringify(pupil)}`)
    } catch (error: any) {
      this.logService.warn(`ERROR: ${error.message}`)
    }

    // Only set the pupil.checkComplete flag if the pupil is still set to the same check, and a restart has not been given, and the
    // pupil has not been marked as not attending.
    if (pupil !== undefined &&
      pupil.attendanceId === null &&
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
