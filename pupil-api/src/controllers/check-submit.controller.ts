
import * as apiResponse from './api-response'
import { Request, Response } from 'express'

class CheckSubmitController {
  async postSubmit (req: Request, res: Response) {
    return res.status(501).send('Not yet implemented')
  }
}

export default new CheckSubmitController()
