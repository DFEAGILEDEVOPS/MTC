import { SqlService } from '../../sql/sql.service'
import { ICheckWindow } from '../../schemas/check-window'

export interface ICheckWindowDataService {
  getActiveCheckWindow (): Promise<ICheckWindow>
}

export class CheckWindowDataService implements ICheckWindowDataService {

  private _sqlService: SqlService

  constructor () {
    this._sqlService = new SqlService()
  }

  getActiveCheckWindow (): Promise<ICheckWindow> {
    const sql = `SELECT TOP 1 *
    FROM [mtc_admin].checkWindow
    WHERE isDeleted = 0
    AND GETUTCDATE() > adminStartDate AND GETUTCDATE() < adminEndDate`
    return this._sqlService.query(sql)
  }
}
