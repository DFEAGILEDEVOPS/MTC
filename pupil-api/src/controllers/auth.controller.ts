
import { Request, Response } from 'express'
import * as winston from 'winston'

import * as apiResponse from './api-response'
import * as pupilAuthenticationService from '../services/pupil-authentication.service'

class AuthController {
  async postAuth (req: Request, res: Response) {
    const contentType = req.get('Content-Type')
    if (contentType !== 'application/json') {
      return apiResponse.badRequest(res)
    }

    const {pupilPin, schoolPin} = req.body

    try {
      await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
    } catch (error) {
      winston.error('Failed to authenticate pupil: ' + error.message)
      return apiResponse.unauthorised(res)
    }
  }
}

export default new AuthController()
