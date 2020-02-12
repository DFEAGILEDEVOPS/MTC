import { ISqlService } from '../../sql/sql.service'

export class CheckPinExpiryService {
  private sqlService: ISqlService

  constructor (theSqlService: ISqlService) {
    this.sqlService = theSqlService
  }

  async process () {
    console.log('process() called')
    const sql = `DELETE FROM [mtc_admin].[checkPin] WHERE pinExpiresAt < GETUTCDATE()`
    const res = await this.sqlService.modify(sql, [])
    console.log('res', res)
  }
}
