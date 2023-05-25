import { type ISqlService, SqlService } from '../../sql/sql.service'
import { type UserInputTypeLookup } from './prepare-answers-and-inputs.data.service'

export interface IUserInputService {
  getUserInputLookupTypeId (eventType: string): Promise<number | undefined>
}

export class UserInputService implements IUserInputService {
  private readonly userInputLookupCache = new Map<string, number>()
  private readonly sqlService: ISqlService
  private initialised = false

  constructor (sqlService?: ISqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  private async sqlGetUserInputLookupData (): Promise<UserInputTypeLookup[]> {
    const sql = 'SELECT id, name, code FROM mtc_results.userInputTypeLookup'
    return this.sqlService.query(sql)
  }

  /**
   * Retrieve the SQL userInputTypeLookup cache it in a Map indexed by the DB `code` e.g. 'M' for mouse input
   */
  private async cacheUserInputTypeLookupData (): Promise<void> {
    const data = await this.sqlGetUserInputLookupData()
    this.userInputLookupCache.clear()
    data.forEach(row => {
      this.userInputLookupCache.set(row.code, row.id)
    })
  }

  private async initialise (): Promise<void> {
    await this.cacheUserInputTypeLookupData()
    this.initialised = true
  }

  /**
   * Find the database FK for a particular input type: mouse, touch, pen, keyboard, unknown
   * The parameter EventType has been produced from the pupil-spa {@link https://github.com/DFEAGILEDEVOPS/MTC/blob/master/pupil-spa/src/app/practice-question/practice-question.component.ts|EventType}
   * class.
   * @param eventType
   * @private
   */
  public async getUserInputLookupTypeId (eventType: string): Promise<number | undefined> {
    if (!this.initialised) {
      await this.initialise()
    }
    switch (eventType) {
      case 'mouse':
        return this.userInputLookupCache.get('M')
      case 'touch':
        return this.userInputLookupCache.get('T')
      case 'pen':
        return this.userInputLookupCache.get('P')
      case 'keyboard':
        return this.userInputLookupCache.get('K')
      case 'unknown':
      default:
        return this.userInputLookupCache.get('X')
    }
  }
}
