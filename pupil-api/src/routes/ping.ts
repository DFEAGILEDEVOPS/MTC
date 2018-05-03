'use strict'

import { Router as Router, Request, Response } from 'express'
import * as ping from '../controllers/ping'

export class PingRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.get('/', (req: Request, res: Response) => ping(req, res))
  }
}

const pingRouter = new PingRouter()
pingRouter.init()

export default pingRouter.router
