import { Router } from 'express'
import type { Request, Response } from 'express'
import { RedisAuthController } from '../controllers/redis.auth.controller'

export interface IAuthController {
  postAuth (req: Request, res: Response): Promise<Response>
}

export class AuthRouter {
  router: Router
  authController: IAuthController

  constructor () {
    this.authController = new RedisAuthController()
    this.router = Router()
    this.init()
  }

  public init (): any {
    this.router.route('/').all((req: Request, res: Response) => { // eslint-disable-line @typescript-eslint/no-misused-promises
      if (req.method !== 'POST') return res.sendStatus(405)
      return this.authController.postAuth(req, res)
    })
  }
}

const authRouter = new AuthRouter()
authRouter.init()

export default authRouter.router
