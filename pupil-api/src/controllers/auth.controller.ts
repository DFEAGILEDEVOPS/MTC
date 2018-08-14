
import { Request, Response } from 'express'
import * as apiResponse from './api-response'

class AuthController {
  async postAuth (req: Request, res: Response) {
    const contentType = req.get('Content-Type')
    if (contentType !== 'application/json') {
      return apiResponse.badRequest(res)
    }
  }
}

export default new AuthController()
