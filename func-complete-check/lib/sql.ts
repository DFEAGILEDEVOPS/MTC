
import * as mssql from 'mssql'
import config from '../config'

export interface ISqlService {
  getCheckFormDataByCheckCode (checkCode: string): Promise<any>
}

export class SqlService implements ISqlService {

  private _pool: mssql.ConnectionPool

  constructor () {
    this._pool = new mssql.ConnectionPool(config.Sql)
  }

  async getCheckFormDataByCheckCode (checkCode: string) {
    try {
      await this._pool.connect()
      const request = new mssql.Request(this._pool)
      const sql = `SELECT TOP 1 chk.* , cs.code AS checkStatusCode, f.formData
               FROM mtc_admin.[check] chk
               INNER JOIN mtc_admin.[checkStatus] cs ON (chk.checkStatus_id = cs.id)
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
      return request.query(sql)
    } catch (err) {
      console.error(err.message)
      throw err
    } finally {
      await this._pool.close()
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
