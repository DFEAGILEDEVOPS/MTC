import { type ISqlService } from '../../sql/sql.service'

export class CheckPinExpiryService {
  private readonly sqlService: ISqlService

  constructor (theSqlService: ISqlService) {
    this.sqlService = theSqlService
  }

  async process (): Promise<any> {
    const sql = 'DELETE FROM [mtc_admin].[checkPin] WHERE pinExpiresAt < GETUTCDATE()'
    return this.sqlService.modify(sql, [])
  }
}
