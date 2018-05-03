'use strict'

import { Router as Router, Request, Response } from 'express'
const { auth } = require('../controllers/auth')

export class AuthRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.route('/auth').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      auth(req, res)
    })
  }
}

const authRouter = new AuthRouter()
authRouter.init()

export default authRouter.router
