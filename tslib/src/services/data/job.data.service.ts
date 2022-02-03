import { TYPES } from 'mssql'
import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'

export interface IJobDataService {
  setJobStarted (jobId: number): Promise<void>
  setJobComplete (jobId: number): Promise<void>
}

export class JobDataService implements IJobDataService {
  private readonly sqlService: ISqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async setJobStarted (jobId: number): Promise<void> {
    const params = new Array<ISqlParameter>()
    params.push({
      name: '@startedAt',
      type: TYPES.DateTimeOffset,
      value: Date.now
    })
    params.push({
      name: '@id',
      type: TYPES.Int,
      value: jobId
    })
    return this.sqlService.modify('UPDATE mtc_admin.[job] SET startedAt=@startedAt WHERE id=@id', params)
  }

  async setJobComplete (jobId: number): Promise<void> {
    const params = new Array<ISqlParameter>()
    params.push({
      name: '@completedAt',
      type: TYPES.DateTimeOffset,
      value: Date.now
    })
    params.push({
      name: '@id',
      type: TYPES.Int,
      value: jobId
    })
    return this.sqlService.modify('UPDATE mtc_admin.[job] SET completedAt=@completedAt WHERE id=@id', params)
  }
}
