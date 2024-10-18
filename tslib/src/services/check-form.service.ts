import * as mssql from 'mssql'
import { SqlService } from '../sql/sql.service'
import config from '../config'
const RA = require('ramda-adjunct')

interface CheckFormItem {
  f1: number
  f2: number
}

export interface ICheckFormService {
  getCheckFormDataByCheckCode (checkCode: string): Promise<any>
  getCheckFormForCheckCode (checkCode: string): Promise<CheckFormItem[]>
  getLiveFormQuestionCount (): number
}

export class CheckFormService implements ICheckFormService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  getLiveFormQuestionCount (): number {
    return config.LiveFormQuestionCount
  }

  async getCheckFormDataByCheckCode (checkCode: string): Promise<any> {
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
    if (RA.isNilOrEmpty(result) === true) return
    if (result[0].formData !== undefined) {
      return result[0].formData
    }
  }

  async getCheckFormForCheckCode (checkCode: string): Promise<CheckFormItem[]> {
    const rawCheckFormData = await this.getCheckFormDataByCheckCode(checkCode)
    if (rawCheckFormData === undefined) { throw Error(`check-receiver: CheckFormData not found for checkCode ${checkCode}`) }
    let checkForm: CheckFormItem[]
    try {
      checkForm = JSON.parse(rawCheckFormData)
    } catch (error: any) {
      throw new Error(`check-receiver: Failed to parse JSON in checkForm for checkCode ${checkCode} error: ${error.message}`)
    }
    if (checkForm === undefined) {
      throw new Error(`check-receiver: CheckForm not found for checkCode ${checkCode}`)
    }
    return checkForm
  }
}
