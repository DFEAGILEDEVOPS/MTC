'use strict'

import { Router as Router, Request, Response } from 'express'
const { checkStarted } = require('../controllers/check-started')

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
    this.router.route('/start').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      checkStarted(req, res)
    })
  }
}

const checkStartRouter = new CheckStartedRouter()
checkStartRouter.init()

export default checkStartRouter.router
