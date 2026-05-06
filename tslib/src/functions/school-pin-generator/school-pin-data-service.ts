import { SqlService } from '../../sql/sql.service'

export interface ISchoolPinDataService {
  getAllowedWords (): Promise<string[]>
}

export class SchoolPinDataService implements ISchoolPinDataService {
  private readonly sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async getAllowedWords (): Promise<string[]> {
    const sql = 'SELECT val FROM [mtc_admin].[schoolPin]'
    const results = await this.sqlService.query(sql)
    return results.map((result: any) => result.val)
  }
}
