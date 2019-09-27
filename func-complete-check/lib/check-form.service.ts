
import * as mssql from 'mssql'
import config from '../config'
import * as R from 'ramda'

export interface ICheckFormService {
  getCheckFormDataByCheckCode (checkCode: string): Promise<any>
}

export class CheckFormService implements ICheckFormService {

  private connection: mssql.ConnectionPool

  constructor () {
    this.connection = new mssql.ConnectionPool(config.Sql)
  }

  async getCheckFormDataByCheckCode (checkCode: string) {
    let pool: mssql.ConnectionPool
    try {
      pool = await this.connection.connect()
      const request = new mssql.Request(pool)
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
      this.addParamsToRequestSimple(params, request)
      const result: mssql.IResult<any> = await request.query(sql)
      if (!R.isNil(result.recordset)) {
        return result.recordset[0].formData
      }
    } catch (err) {
      console.error(err.message)
      throw err
    } finally {
      await this.connection.close()
    }
  }

  private addParamsToRequestSimple (params: Array<any>, request: mssql.Request) {
    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        request.input(param.name, param.type, param.value)
      }
    }
  }
}
