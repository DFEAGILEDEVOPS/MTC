import { SqlService, type ITransactionRequest, type ISqlParameter } from '../../sql/sql.service'
import * as mssql from 'mssql'

export interface IBatchCheckNotifierDataService {
  createCheckCompleteRequest (checkCode: string): ITransactionRequest[]

  createProcessingFailedRequest (checkCode: string): ITransactionRequest

  createCheckReceivedRequest (checkCode: string): ITransactionRequest

  executeRequestsInTransaction (requests: ITransactionRequest[]): Promise<void>
}

export class BatchCheckNotifierDataService implements IBatchCheckNotifierDataService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  createCheckCompleteRequest (checkCode: string): ITransactionRequest[] {
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
    return [checkRequest, pupilRequest]
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
