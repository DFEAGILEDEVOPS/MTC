
import { Request, Response } from 'express'
import * as winston from 'winston'

import * as apiResponse from './api-response'
import { PupilAuthenticationService } from '../services/pupil-authentication.service'
import * as azureStorage from 'azure-storage'

class AuthController {
  async postAuth (req: Request, res: Response) {
    const contentType = req.get('Content-Type')
    if (contentType !== 'application/json' && contentType !== 'application/json; charset=utf-8') {
      winston.error('Bad Request: Content type is: ' + contentType)
      return apiResponse.badRequest(res)
    }

    const {pupilPin, schoolPin} = req.body

    try {
      const pupilAuthenticationService = new PupilAuthenticationService(azureStorage.createTableService())
      await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
    } catch (error) {
      winston.error('Failed to authenticate pupil: ' + error.message)
      return apiResponse.unauthorised(res)
    }
  }
}

export default new AuthController()
