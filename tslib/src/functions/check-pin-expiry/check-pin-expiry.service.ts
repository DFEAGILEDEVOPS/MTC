import { ISqlService } from '../../sql/sql.service'

export class CheckPinExpiryService {
  private sqlService: ISqlService

  constructor (theSqlService: ISqlService) {
    this.sqlService = theSqlService
  }

  async process () {
    const sql = `DELETE FROM [mtc_admin].[checkPin] WHERE pinExpiresAt < GETUTCDATE()`
    return this.sqlService.modify(sql, [])
  }
}
