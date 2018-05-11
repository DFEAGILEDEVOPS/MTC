
import { Request, Response } from 'express'

class AuthController {
  async postAuth (req: Request, res: Response) {
    return res.status(501).send('Not yet implemented')
  }
}

export default new AuthController()
