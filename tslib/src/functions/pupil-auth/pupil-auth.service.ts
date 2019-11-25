import { IRedisService, RedisService } from '../../caching/redis-service'
import config from '../../config'
import { HttpRequest, HttpMethod } from '@azure/functions'

export interface IPupilAuthFunctionBindings {
  pupilLoginQueue: Array<any>
}

export interface IHttpResponse {
  body?: any
  status: number
  headers: {
    [key: string]: string;
  }
  method: HttpMethod
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

  async authenticate (bindings: IPupilAuthFunctionBindings, req: HttpRequest): Promise<any> {
    if (req.method === 'OPTIONS') {
      return {
        body: '',
        headers:
        {
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Headers': 'content-type',
          'Access-Control-Allow-Origin': config.PupilAuth.CorsWhitelist
        },
        status: 204
      }
    }

    const noAuth = {
      status: 401
    }

    if (req.body === undefined) return noAuth
    if (req.body.schoolPin === undefined) return noAuth
    if (req.body.pupilPin === undefined) return noAuth

    const cacheKey = this.buildCacheKey(req.body.schoolPin, req.body.pupilPin)
    const preparedCheck = await this.redisService.get(cacheKey)
    if (!preparedCheck) return noAuth

    const checkStartedLookupKey = this.buildCheckStartedLookupKey(preparedCheck.checkCode)
    await this.redisService.setex(checkStartedLookupKey, cacheKey, this.eightHoursInSeconds)

    if (preparedCheck.config.practice === false) {
      await this.redisService.expire(cacheKey, config.PupilAuth.PreparedCheckExpiryAfterLoginSeconds)
    }

    const pupilLoginMessage = {
      checkCode: preparedCheck.checkCode,
      loginAt: new Date(),
      version: 1
    }
    bindings.pupilLoginQueue = []
    bindings.pupilLoginQueue.push(pupilLoginMessage)

    return {
      status: 200,
      body: preparedCheck,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Origin': config.PupilAuth.CorsWhitelist
      }
    }
  }

  private buildCheckStartedLookupKey (checkCode: string) {
    return `check-started-check-lookup:${checkCode}`
  }

  private buildCacheKey (schoolPin: string, pupilPin: string): string {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  }

}
