import { Router } from 'express'
import type { Request, Response } from 'express'
import { PupilFeedbackController } from '../controllers/feedback.controller'

export class FeedbackRouter {
  router: Router
  feedbackController: PupilFeedbackController

  constructor () {
    this.feedbackController = new PupilFeedbackController()
    this.router = Router()
    this.init()
  }

  public init (): any {
    this.router.route('/').all(async (req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      return this.feedbackController.postFeedback(req, res)
    })
  }
}

const feedbackRouter = new FeedbackRouter()
feedbackRouter.init()

export default feedbackRouter.router
