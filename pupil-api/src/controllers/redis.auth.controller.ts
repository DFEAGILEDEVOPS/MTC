import { Request, Response } from 'express'
import logger from '../services/log.service'
import * as apiResponse from './api-response'
import { RedisPupilAuthenticationService, IPupilAuthenticationService } from '../services/redis-pupil-auth.service'
import { IAuthController } from '../routes/auth'

export class RedisAuthController implements IAuthController {
  private readonly redisAuthService: IPupilAuthenticationService

  constructor (redisAuthService?: IPupilAuthenticationService) {
    if (redisAuthService === undefined) {
      redisAuthService = new RedisPupilAuthenticationService()
    }
    this.redisAuthService = redisAuthService
  }

  async postAuth (req: Request, res: Response) {
    const contentType = req.get('Content-Type')
    if (!req.is('application/json')) {
      logger.error('Bad Request: Content type is: ' + contentType)
      return apiResponse.badRequest(res)
    }

    const { pupilPin, schoolPin, buildVersion } = req.body
    if (!schoolPin || !pupilPin || !buildVersion) return apiResponse.unauthorised(res)

    try {
      const data = await this.redisAuthService.authenticate(schoolPin, pupilPin, buildVersion)
      if (data === undefined) {
        return apiResponse.unauthorised(res)
      }
      return apiResponse.sendJson(res, data)
    } catch (error) {
      logger.error('Failed to authenticate pupil: ', error)
      return apiResponse.unauthorised(res)
    }
  }
}
