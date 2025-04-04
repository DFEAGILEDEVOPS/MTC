import { Router } from 'express'
import type { Request, Response } from 'express'
import { RedisAuthController } from '../controllers/auth.controller'

export class AuthRouter {
  router: Router
  authController: RedisAuthController

  constructor () {
    this.authController = new RedisAuthController()
    this.router = Router()
    this.init()
  }

  public init (): any {
    this.router.route('/').all(async (req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      return this.authController.postAuth(req, res)
    })
  }
}

const authRouter = new AuthRouter()
authRouter.init()

export default authRouter.router
