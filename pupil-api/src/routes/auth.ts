'use strict'

import { Router as Router, Request, Response } from 'express'
import * as authController from '../controllers/auth.controller'

export class AuthRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.route('/').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      authController.default.postAuth(req, res)
    })
  }
}

const authRouter = new AuthRouter()
authRouter.init()

export default authRouter.router
