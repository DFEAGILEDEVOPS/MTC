import type { Request, Response } from 'express'
import logger from '../services/log.service'
import * as apiResponse from '../helpers/api-response'
import { type IJwtService, JwtService } from '../../services/jwt.service'

export class SubmitController {
  private readonly jwtService: IJwtService

  constructor (jwtService?: IJwtService) {
    if (jwtService === undefined) {
      jwtService = new JwtService()
    }
    this.jwtService = jwtService
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
    if (token == null) return res.sendStatus(401)
    try {
      await this.jwtService.verify(token)
    } catch (error: any) {
      logger.error(`JWT verification failed: ${error.message}`)
      return apiResponse.unauthorised(res)
    }
  }
}
