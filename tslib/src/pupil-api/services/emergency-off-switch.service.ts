import { SqlService, type ISqlService } from '../../sql/sql.service.js'

export interface EmergencyOffSwitchState {
  isEnabled: boolean
  updatedAt: unknown
  updatedBy_userId: number | null
}

export class EmergencyOffSwitchService {
  private readonly sqlService: Pick<ISqlService, 'query'>

  constructor (sqlService?: Pick<ISqlService, 'query'>) {
    this.sqlService = sqlService ?? new SqlService()
  }

  async getState (): Promise<EmergencyOffSwitchState> {
    const rows = await this.sqlService.query(`
      SELECT [isEnabled], [updatedAt], [updatedBy_userId]
      FROM [mtc_admin].[emergencyOffSwitch]
      WHERE [id] = 1
    `) as EmergencyOffSwitchState[]
    const state = rows[0]
    if (state === undefined || typeof state.isEnabled !== 'boolean') {
      throw new Error('Emergency off-switch state has not been initialized')
    }
    return state
  }
}
