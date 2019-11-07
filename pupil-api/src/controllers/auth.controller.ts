import { Request, Response } from 'express'
import logger from '../services/log.service'
import * as apiResponse from './api-response'
import { pupilAuthenticationService } from '../services/pupil-auth.service'
import { RedisPupilAuthenticationService } from '../services/redis-pupil-auth.service'
import * as featureToggles from 'feature-toggles'
import { RedisService } from '../services/redis.service'

class AuthController {
  private useRedisAuth: boolean
  private redisAuthService: RedisPupilAuthenticationService

  constructor () {
    this.useRedisAuth = featureToggles.isFeatureEnabled('preparedChecksInRedis')
    logger.info('auth mode:', this.useRedisAuth ? 'redis' : 'table storage')
    if (this.useRedisAuth) {
      this.redisAuthService = new RedisPupilAuthenticationService(new RedisService())
    }
  }

  async postAuth (req: Request, res: Response) {
    const contentType = req.get('Content-Type')
    if (!req.is('application/json')) {
      logger.error('Bad Request: Content type is: ' + contentType)
      return apiResponse.badRequest(res)
    }

    const { pupilPin, schoolPin } = req.body
    let data
    try {
      if (this.useRedisAuth) {
        data = this.redisAuthService.authenticate(pupilPin, schoolPin)
        if (data === null) {
          return apiResponse.unauthorised(res)
        }
      } else {
        data = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
      }
      apiResponse.sendJson(res, data)
    } catch (error) {
      logger.error('Failed to authenticate pupil: ', error)
      return apiResponse.unauthorised(res)
    }
  }
}

export default new AuthController()
