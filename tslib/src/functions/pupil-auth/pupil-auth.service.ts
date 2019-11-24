import { IRedisService, RedisService } from '../../caching/redis-service'
import config from '../../config'
import { HttpRequest } from '@azure/functions'

export interface IPupilAuthFunctionBindings {
  pupilLoginQueue: Array<any>
}

export class PupilAuthService {

  private redisService: IRedisService
  private eightHoursInSeconds: number = 28800

  constructor (redisService?: IRedisService) {
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async authenticate2 (req: HttpRequest, bindings: IPupilAuthFunctionBindings): Promise<any> {
    if (req.method === 'OPTIONS') {
      return {
        body: '',
        headers:
        {
          'Access-Control-Allow-Methods' : 'POST,OPTIONS',
          'allow' : 'POST,OPTIONS'
        },
        status: 200
      }
    }

    const noAuth = {
      status: 401
    }

    if (req.body === undefined) return noAuth
    if (req.body.schoolPin === undefined) return noAuth
    if (req.body.pupilPin === undefined) return noAuth

    const cacheKey = this.buildCacheKey(req.body.schoolPin, req.body.pupilPin)
    await this.redisService.get(cacheKey)
  }

  async authenticate (schoolPin: string, pupilPin: string, bindings: IPupilAuthFunctionBindings): Promise<object | undefined> {
    if (schoolPin.length === 0 || pupilPin.length === 0) {
      throw new Error('schoolPin and pupilPin cannot be an empty string')
    }
    const cacheKey = this.buildCacheKey(schoolPin, pupilPin)
    const preparedCheckEntry = await this.redisService.get(cacheKey)
    if (!preparedCheckEntry) {
      return
    }

    // Emit a successful login to the queue
    const pupilLoginMessage = {
      checkCode: preparedCheckEntry.checkCode,
      loginAt: new Date(),
      version: 1
    }
    bindings.pupilLoginQueue = []
    bindings.pupilLoginQueue.push(pupilLoginMessage)
    const checkStartedLookupKey = this.buildCheckStartedLookupKey(preparedCheckEntry.checkCode)
    await this.redisService.setex(checkStartedLookupKey, cacheKey, this.eightHoursInSeconds)
    if (preparedCheckEntry.config.practice === false) {
      await this.redisService.expire(cacheKey, config.PreparedCheckExpiryAfterLoginSeconds)
    }
    return preparedCheckEntry
  }

  private buildCheckStartedLookupKey (checkCode: string) {
    return `check-started-check-lookup:${checkCode}`
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
