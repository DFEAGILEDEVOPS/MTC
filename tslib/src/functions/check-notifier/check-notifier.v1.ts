import { ICheckNotificationMessage } from './check-notification-message'
import { SqlService } from '../../sql/sql.service'
import * as mssql from 'mssql'

export class CheckNotifier {
  private checkNotifierDataService: ICheckNotifierDataService

  constructor (checkNotifierDataService?: ICheckNotifierDataService) {
    if (checkNotifierDataService === undefined) {
      checkNotifierDataService = new CheckNotifierDataService()
    }
    this.checkNotifierDataService = checkNotifierDataService
  }

  async notify (notification: ICheckNotificationMessage) {
    return this.checkNotifierDataService.updateCheckAsComplete(notification.checkCode)
  }
}

export enum CheckStatus {
  New = 1,
  // Expired = 2, To be removed
  Complete = 3,
  Started = 4,
  Collected = 5,
  NotReceived = 6
}

export class CheckNotifierDataService implements ICheckNotifierDataService {
  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }
  updateCheckAsComplete (checkCode: string): Promise<void> {
    const sql = `UPDATE [mtc_admin].[check]
                  SET checkStatus_id=@checkStatusId
                  WHERE checkCode=@checkCode`
    const params = [
      {
        type: mssql.Int,
        name: 'checkStatusId',
        value: CheckStatus.Complete
      },
      {
        type: mssql.UniqueIdentifier,
        name: 'checkCode',
        value: checkCode
      }
    ]
    return this.sqlService.modify(sql, params)
  }
}

export interface ICheckNotifierDataService {
  updateCheckAsComplete (checkCode: string): Promise<void>
}
