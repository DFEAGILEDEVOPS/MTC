import { SqlService } from '../../sql/sql.service'
import { RedisService } from '../../caching/redis-service'

export class CheckWindowService {

  private _sqlService: SqlService
  private _redisService: RedisService

  constructor () {
    this._sqlService = new SqlService()
    this._redisService = new RedisService()
  }
  getCurrentCheckWindowId () {
    let checkWindow
    const cachedItem = this._redisService.get('currentCheckWindow')
    if (!cachedItem) {
      checkWindow = this._sqlService.query('TODO')
    }
    return checkWindow
  }
}
