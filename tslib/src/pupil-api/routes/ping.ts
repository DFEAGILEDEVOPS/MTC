import { Router } from 'express'
import type { Request, Response } from 'express'
import { PingController } from '../controllers/ping.controller'

export class PingRouter {
  router: Router
  controller: PingController

  constructor () {
    this.router = Router()
    this.init()
    this.controller = new PingController()
  }

  private readonly getPing = (req: Request, res: Response): void => {
    void this.controller.getPing(req, res)
  }

  public init (): void {
    this.router.get('/', this.getPing)
  }
}

const pingRouter = new PingRouter()
pingRouter.init()

export default pingRouter.router
