import { TYPES } from 'mssql'
import { type ISqlService, SqlService } from '../../sql/sql.service'

export interface ICheckSyncStatus {
  resultsSynchronised: number | boolean
}

export interface IDlqReconciliationDataService {
  getCheckSyncStatus: (checkCode: string) => Promise<ICheckSyncStatus | undefined>
}

export class DlqReconciliationDataService implements IDlqReconciliationDataService {
  private readonly sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  async getCheckSyncStatus (checkCode: string): Promise<ICheckSyncStatus | undefined> {
    const sql = `
      SELECT c.resultsSynchronised
      FROM [mtc_admin].[check] c
      WHERE c.checkCode = @checkCode
    `
    const params = [{ name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }]
    const rows = await this.sqlService.query(sql, params)
    if (rows.length === 0) {
      return undefined
    }
    const firstRow = rows[0]
    return {
      resultsSynchronised: firstRow.resultsSynchronised
    }
  }
}
