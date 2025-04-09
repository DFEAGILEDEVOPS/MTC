import { JwtService, type IJwtService } from '../../services/jwt.service'
import type { Request, Response } from 'express'
import logger from '../services/log.service'
import apiResponse from '../helpers/api-response'
import { type IPupilFeedbackService, PupilFeedbackService } from '../services/feedback.service'

export class PupilFeedbackController {
  private readonly jwtService: IJwtService
  private readonly pupilFeedbackService: IPupilFeedbackService

  constructor (jwtService?: IJwtService, pupilFeedbackService?: IPupilFeedbackService) {
    if (jwtService === undefined) {
      jwtService = new JwtService()
    }
    this.jwtService = jwtService

    if (pupilFeedbackService === undefined) {
      pupilFeedbackService = new PupilFeedbackService()
    }
    this.pupilFeedbackService = pupilFeedbackService
  }

  async postFeedback (req: Request, res: Response): Promise<any> {
    const contentType = req.get('Content-Type')
    if (req.is('application/json') === false) {
      logger.error(`Bad Request: Content type is: ${contentType}`)
      return apiResponse.badRequest(res)
    }

    const authHeader = req.headers.authorization
    if (authHeader === undefined) {
      return apiResponse.unauthorised(res)
    }
    const token = authHeader.split(' ')[1]
    if (token === undefined || token === '') {
      return apiResponse.unauthorised(res)
    }
    try {
      await this.jwtService.verify(token)
      await this.pupilFeedbackService.putFeedbackOnQueue(req.body)
    } catch (error: any) {
      logger.error(`JWT verification failed: ${error.message} for check:${req.body.checkCode}}`)
      return apiResponse.unauthorised(res)
    }
    return apiResponse.sendJson(res, {})
  }
}
