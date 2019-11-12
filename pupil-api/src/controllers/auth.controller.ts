import { Request, Response } from 'express'
import logger from '../services/log.service'
import * as apiResponse from './api-response'
import { pupilAuthenticationService } from '../services/azure-pupil-auth.service'
import { RedisPupilAuthenticationService } from '../services/redis-pupil-auth.service'
import { FeatureService, IFeatureService } from '../services/feature.service'

export class AuthController {
  private useRedisAuth: boolean
  private redisAuthService: RedisPupilAuthenticationService
  private featureService: IFeatureService

  constructor (featureService?: IFeatureService) {
    if (featureService === undefined) {
      featureService = new FeatureService()
    }
    this.featureService = featureService
    this.useRedisAuth = this.featureService.redisAuthMode()
    const mode = this.useRedisAuth ? 'redis' : 'table storage'
    logger.info(`auth mode:${mode}`)
    if (this.useRedisAuth) {
      this.redisAuthService = new RedisPupilAuthenticationService()
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
        data = await this.redisAuthService.authenticate(schoolPin, pupilPin)
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
