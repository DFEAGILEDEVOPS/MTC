'use strict'

import { Router as Router, Request, Response } from 'express'
import * as pingController from '../controllers/ping.controller'

export class PingRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.get('/', (req: Request, res: Response) => pingController.getPing(req, res))
  }
}

const pingRouter = new PingRouter()
pingRouter.init()

export default pingRouter.router
