'use strict'

import { Router as Router, Request, Response } from 'express'
import * as checkStartController from '../controllers/check-start.controller'

export class CheckStartedRouter {
  router: Router

  /**
   * Initialize the IndexRouter
   */
  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.route('/').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      return checkStartController.default.postStartCheck(req, res)
    })
  }
}

const checkStartRouter = new CheckStartedRouter()
checkStartRouter.init()

export default checkStartRouter.router
