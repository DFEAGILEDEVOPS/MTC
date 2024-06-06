import type { Request, Response } from 'express'
import logger from '../services/log.service'
import * as apiResponse from '../helpers/api-response'
import { type IJwtService, JwtService } from '../../services/jwt.service'
import { CheckSubmitService, type ICheckSubmitService } from '../../services/check-submit.service'

export class SubmitController {
  private readonly jwtService: IJwtService
  private readonly checkSubmitService: ICheckSubmitService

  constructor (jwtService?: IJwtService, checkSubmitService?: ICheckSubmitService) {
    if (jwtService === undefined) {
      jwtService = new JwtService()
    }
    this.jwtService = jwtService

    if (checkSubmitService === undefined) {
      checkSubmitService = new CheckSubmitService()
    }
    this.checkSubmitService = checkSubmitService
  }

  async postSubmit (req: Request, res: Response): Promise<any> {
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
    if (token == null) return apiResponse.unauthorised(res)
    try {
      await this.jwtService.verify(token)
    } catch (error: any) {
      logger.error(`JWT verification failed: ${error.message} for check:${req.body.checkCode}}`)
      return apiResponse.unauthorised(res)
    }
    try {
      await this.checkSubmitService.submit(req.body)
    } catch (error: any) {
      if (error.code = 'MessageSizeExceeded') {
        logger.alert(`Message received but rejected from Service Bus as being too large: message size is ${req.body?.length}`)
        return apiResponse.messageTooLarge(res)
      }
      return apiResponse.serverError(res)
    }
    return apiResponse.sendJson(res, {})
  }
}
