import { Request, Response } from 'express'
import * as moment from 'moment'
import { PingService } from '../services/ping.service'

export class PingController {
  private readonly pingService: PingService

  constructor () {
    this.pingService = new PingService()
  }

  async getPing (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
    let buildNumber: object | string = 'NOT FOUND'
    let commitId: object | string = 'NOT FOUND'
    try {
      buildNumber = await this.pingService.getBuildNumber()
    } catch (error) {
      // error
    }

    try {
      commitId = await this.pingService.getCommitId()
    } catch (error) {
      // error
    }

    res.setHeader('Content-Type', 'application/json')
    const obj = {
      Build: buildNumber,
      Commit: commitId,
      CurrentServerTime: moment().toISOString()
    }
    return res.status(200).send(obj)
  }
}
