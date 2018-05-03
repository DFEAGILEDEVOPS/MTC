'use strict'

import { Router as Router, Request, Response } from 'express'
const { postCheck } = require('../controllers/check-submission')

export class CheckSubmitRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.route('/').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      postCheck(req, res)
    })
  }
}

const checkSubmitRouter = new CheckSubmitRouter()
checkSubmitRouter.init()

export default checkSubmitRouter.router
