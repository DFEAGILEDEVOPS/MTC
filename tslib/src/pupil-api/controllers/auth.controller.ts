import type { Request, Response } from 'express'
import logger from '../services/log.service.js'
import apiResponse from '../helpers/api-response.js'
import { RedisPupilAuthenticationService } from '../services/redis-pupil-auth.service.js'
import type { IPupilAuthenticationService } from '../services/redis-pupil-auth.service.js'

export class RedisAuthController {
  private readonly redisAuthService: IPupilAuthenticationService

  constructor (redisAuthService?: IPupilAuthenticationService) {
    if (redisAuthService === undefined) {
      redisAuthService = new RedisPupilAuthenticationService()
    }
    this.redisAuthService = redisAuthService
  }

  async postAuth (req: Request, res: Response): Promise<any> {
    const contentType = req.get('Content-Type')
    if (req.is('application/json') === false) {
      logger.error(`Bad Request: Content type is: ${contentType}`)
      return apiResponse.badRequest(res)
    }

    const { pupilPin, schoolPin, buildVersion } = req.body
    if (schoolPin === undefined || pupilPin === undefined || buildVersion === undefined) return apiResponse.unauthorised(res)

    try {
      const normalizedSchoolPin = String(schoolPin).trim().toLowerCase()
      const normalizedPupilPin = String(pupilPin).trim()
      const data = await this.redisAuthService.authenticate(normalizedSchoolPin, normalizedPupilPin, buildVersion)
      if (data === undefined) {
        return apiResponse.unauthorised(res)
      }
      return apiResponse.sendJson(res, data)
    } catch (error: any) {
      logger.error('Failed to authenticate pupil: ', error)
      return apiResponse.unauthorised(res)
    }
  }
}
