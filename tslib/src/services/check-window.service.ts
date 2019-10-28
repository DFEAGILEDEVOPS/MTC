
import { ICheckWindow } from '../schemas/check-window'
import { IRedisService, RedisService } from '../caching/redis-service'
import { ICheckWindowDataService, CheckWindowDataService } from './data/check-window.data.service'
import { ILogger, ConsoleLogger } from '../common/logger'

export interface ICheckWindowService {
  getActiveCheckWindow: Promise<ICheckWindow>
}

export class CheckWindowService {
  private _redisService: IRedisService
  private _checkWindowDataService: ICheckWindowDataService
  private _logger: ILogger
  private _twentyFourHoursInSeconds = 86400

  constructor (redisService?: IRedisService, checkWindowDataService?: ICheckWindowDataService, logger?: ILogger) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this._redisService = redisService

    if (checkWindowDataService === undefined) {
      checkWindowDataService = new CheckWindowDataService()
    }
    this._checkWindowDataService = checkWindowDataService

    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this._logger = logger
  }

  async getActiveCheckWindow (): Promise<ICheckWindow> {
    let cachedWindow
    try {
      cachedWindow = await this._redisService.get('activeCheckWindow')
    } catch (error) {
      this._logger.error(error)
    }
    if (!cachedWindow) {
      const window = await this._checkWindowDataService.getActiveCheckWindow()
      try {
        // tslint:disable-next-line: no-floating-promises
        this._redisService.setex('activeCheckWindow', window, this._twentyFourHoursInSeconds)
      } catch (error) {
        this._logger.error(error)
      }
      return window
    }
    return cachedWindow
  }
}
