
import * as mssql from 'mssql'
import { SqlService } from '../../sql/sql.service'
import * as RA from 'ramda-adjunct'

export interface ICheckFormService {
  getCheckFormDataByCheckCode (checkCode: string): Promise<any>
}

export class CheckFormService implements ICheckFormService {

  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async getCheckFormDataByCheckCode (checkCode: string) {

    const sql = `SELECT TOP 1 f.formData
              FROM mtc_admin.[check] chk
              INNER JOIN mtc_admin.[checkForm] f ON chk.checkForm_id = f.id
              WHERE checkCode = @checkCode`
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: mssql.UniqueIdentifier
      }
    ]
    const result = await this.sqlService.query(sql, params)
    if (RA.isNilOrEmpty(result)) return
    if (result[0].formData) {
      return result[0].formData
    }
  }
}
