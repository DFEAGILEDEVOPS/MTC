import { Router } from 'express'
import type { Request, Response } from 'express'

export class HeadRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init (): void {
    this.router.head('/', (req: Request, res: Response) => res.sendStatus(200))
  }
}

const headRouter = new HeadRouter()
headRouter.init()

export default headRouter.router
