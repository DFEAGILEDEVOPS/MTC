import { ICheckWindow } from '../schemas/check-window'
import { IRedisService, RedisService } from '../caching/redis-service'
import { ICheckWindowDataService, CheckWindowDataService } from './data/check-window.data.service'
import { ILogger, ConsoleLogger } from '../common/logger'

export interface ICheckWindowService {
  getActiveCheckWindow: Promise<ICheckWindow>
}

export class CheckWindowService {
  private redisService: IRedisService
  private checkWindowDataService: ICheckWindowDataService
  private logger: ILogger
  private twentyFourHoursInSeconds = 86400

  constructor (redisService?: IRedisService, checkWindowDataService?: ICheckWindowDataService, logger?: ILogger) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService

    if (checkWindowDataService === undefined) {
      checkWindowDataService = new CheckWindowDataService()
    }
    this.checkWindowDataService = checkWindowDataService

    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger
  }

  async getActiveCheckWindow (): Promise<ICheckWindow> {
    let cachedWindow
    try {
      cachedWindow = await this.redisService.get('activeCheckWindow')
    } catch (error) {
      this.logger.error(error)
    }
    if (!cachedWindow) {
      const window = await this.checkWindowDataService.getActiveCheckWindow()
      // tslint:disable-next-line: no-floating-promises
      this.redisService.setex('activeCheckWindow', window, this.twentyFourHoursInSeconds)
        .catch((error) => this.logger.error(error))
      return window
    }
    return cachedWindow
  }
}
