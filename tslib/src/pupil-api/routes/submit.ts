import { Router } from 'express'
import type { Request, Response } from 'express'
import { SubmitController } from '../controllers/submit.controller'

export class SubmitRouter {
  router: Router
  submitController: SubmitController

  constructor () {
    this.submitController = new SubmitController()
    this.router = Router()
    this.init()
  }

  public init (): any {
    this.router.route('/').all(async (req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      return this.submitController.postSubmit(req, res)
    })
  }
}

const submitRouter = new SubmitRouter()
submitRouter.init()

export default submitRouter.router
