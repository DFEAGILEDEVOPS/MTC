import { SqlService } from '../../sql/sql.service'
import { type ICheckWindow } from '../../schemas/check-window'

export interface ICheckWindowDataService {
  getActiveCheckWindow (): Promise<ICheckWindow>
}

export class CheckWindowDataService implements ICheckWindowDataService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async getActiveCheckWindow (): Promise<ICheckWindow> {
    const sql = `SELECT TOP 1 *
    FROM [mtc_admin].checkWindow
    WHERE isDeleted = 0
    AND GETUTCDATE() > adminStartDate AND GETUTCDATE() < adminEndDate`
    return this.sqlService.query(sql)
  }
}
