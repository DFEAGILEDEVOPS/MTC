import { ISqlService, SqlService } from '../../sql/sql.service'
import { DBQuestion } from './models'

export interface ISyncResultsDataService {
  sqlGetQuestionData (): Promise<Map<string, DBQuestion>>
}

export class SyncResultsDataService implements ISyncResultsDataService {
  private sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    if (!sqlService) {
      this.sqlService = new SqlService()
    } else {
      this.sqlService = sqlService
    }
  }

  public async sqlGetQuestionData (): Promise<Map<string, DBQuestion>> {
    const sql = 'SELECT id, factor1, factor2, code, isWarmup FROM mtc_admin.question'
    const data: DBQuestion[] = await this.sqlService.query(sql)
    const map = new Map<string, DBQuestion>()
    data.forEach(o => {
      if (o.isWarmup === false) {
        map.set(`${o.factor1}x${o.factor2}`, Object.freeze(o))
      }
    })
    return map
  }
}
