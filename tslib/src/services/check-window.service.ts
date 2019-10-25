
import { ICheckWindow } from '../schemas/check-window'
import { IRedisService, RedisService } from '../caching/redis-service'
import { ICheckWindowDataService, CheckWindowDataService } from './data/check-window.data.service'

export interface ICheckWindowService {
  getActiveCheckWindow: Promise<ICheckWindow>
}

export class CheckWindowService {
  private _redisService: IRedisService
  private _checkWindowDataService: ICheckWindowDataService

  constructor (redisService?: IRedisService, checkWindowDataService?: ICheckWindowDataService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this._redisService = redisService

    if (checkWindowDataService === undefined) {
      checkWindowDataService = new CheckWindowDataService()
    }
    this._checkWindowDataService = checkWindowDataService
  }

  async getActiveCheckWindow (): Promise<ICheckWindow> {
    const cachedWindow = this._redisService.get('activeCheckWindow')
    if (!cachedWindow) {
      const window = await this._checkWindowDataService.getActiveCheckWindow()
      // TODO prefer set and forget, it's not the callers issue if it fails
      // remove await and override tslint rule???
      await this._redisService.setex('activeCheckWindow', window, 24)
      return window
    }
    return cachedWindow
  }
}
