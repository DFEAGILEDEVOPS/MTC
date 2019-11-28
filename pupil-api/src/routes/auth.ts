'use strict'

import { Router as Router, Request, Response } from 'express'
import { AuthController } from '../controllers/auth.controller'

export interface IAuthController {
  postAuth (req: Request, res: Response): Promise<Response>
}

export class AuthRouter {
  router: Router
  authController: IAuthController

  constructor () {
    this.authController = new AuthController()
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.route('/').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      return this.authController.postAuth(req, res)
    })
  }
}

const authRouter = new AuthRouter()
authRouter.init()

export default authRouter.router
