import { Request, Response } from 'express'
import logger from '../services/log.service'
import * as apiResponse from './api-response'
import { pupilAuthenticationService } from '../services/azure-pupil-auth.service'
import { RedisPupilAuthenticationService, IPupilAuthenticationService } from '../services/redis-pupil-auth.service'
import { FeatureService, IFeatureService } from '../services/feature.service'
import { IAuthController } from '../routes/auth'

export class AuthController implements IAuthController {
  private redisAuthService: IPupilAuthenticationService
  private featureService: IFeatureService

  constructor (featureService?: IFeatureService, redisAuthService?: IPupilAuthenticationService) {
    if (featureService === undefined) {
      featureService = new FeatureService()
    }
    this.featureService = featureService
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

    const { pupilPin, schoolPin } = req.body
    if (!schoolPin || !pupilPin) return apiResponse.unauthorised(res)

    let data
    try {
      if (this.featureService.redisAuthMode()) {
        data = await this.redisAuthService.authenticate(schoolPin, pupilPin)
        if (data === undefined) {
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
