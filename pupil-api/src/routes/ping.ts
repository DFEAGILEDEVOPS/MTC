'use strict'

import { Router as Router, Request, Response } from 'express'
import * as path from 'path'
import * as fs from 'fs'
const moment = require('moment')

const { postCheck } = require('../controllers/ping')

export class PingRouter {
  router: Router

  constructor () {
    this.router = Router()
    this.init()
  }

  public init () {
    this.router.get('/ping', (req: Request, res: Response) => this.getPing(req, res))
  }

  private async getPing (req: Request, res: Response) {
    // get build number from /build.txt
    // get git commit from /commit.txt
    let buildNumber: object | string = 'NOT FOUND'
    let commitId: object | string = 'NOT FOUND'
    try {
      buildNumber = await this.getBuildNumber()
    } catch (error) {
      // error
    }

    try {
      commitId = await this.getCommitId()
    } catch (error) {
      // error
    }

    res.setHeader('Content-Type', 'application/json')
    let obj = {
      'Build': buildNumber,
      'Commit': commitId,
      'CurrentServerTime': moment().toISOString()
    }
    return res.status(200).send(obj)
  }

  /* Health check */

  private getCommitId () {
    return new Promise(function (resolve, reject) {
      const commitFilePath = path.join(__dirname, '..', 'public', 'commit.txt')
      fs.readFile(commitFilePath, 'utf8', function (err, data) {
        if (!err) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
  }

  private getBuildNumber () {
    // Promise wrapper function
    return new Promise(function (resolve, reject) {
      const buildFilePath = path.join(__dirname, '..', 'public', 'build.txt')
      fs.readFile(buildFilePath, 'utf8', function (err, data) {
        if (!err) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
  }
}

const pingRouter = new PingRouter()
pingRouter.init()

export default pingRouter.router
