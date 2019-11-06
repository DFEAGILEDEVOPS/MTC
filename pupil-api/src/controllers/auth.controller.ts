import { Request, Response } from 'express'
import logger from '../services/log.service'

import * as apiResponse from './api-response'
import { pupilAuthenticationService } from '../services/pupil-auth.service'

class AuthController {
  async postAuth (req: Request, res: Response) {
    const contentType = req.get('Content-Type')
    if (!req.is('application/json')) {
      logger.error('Bad Request: Content type is: ' + contentType)
      return apiResponse.badRequest(res)
    }

    const { pupilPin, schoolPin } = req.body

    try {
      const data = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
      apiResponse.sendJson(res, data)
    } catch (error) {
      logger.error('Failed to authenticate pupil: ', error)
      return apiResponse.unauthorised(res)
    }
  }
}

export default new AuthController()
