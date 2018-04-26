'use strict'

import winston from 'winston'
import { Router as Router, Request, Response } from 'express'
import * as path from 'path'
import * as fs from 'fs'

const { postCheck } = require('../controllers/check-submission')

export class IndexRouter {
  router: Router

  /**
   * Initialize the IndexRouter
   */
  constructor () {
    this.router = Router()
    this.init()
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  public init () {
    this.router.get('/ping', (req: Request, res: Response) => this.getPing(req, res))

    /* check-started microservice */
    this.router.route('/submit').all((req: Request, res: Response) => {
      if (req.method !== 'POST') return res.sendStatus(405)
      postCheck(req, res)
    })
  }

  private async getPing (req: Request, res: Response) {
    // get build number from /build.txt
    // get git commit from /commit.txt
    let buildNumber: object | string = 'NOT FOUND'
    let commitId: object | string = 'NOT FOUND'
    try {
      buildNumber = await this.getBuildNumber()
    } catch (error) {
      winston.error('ERROR: ' + error)
    }

    try {
      commitId = await this.getCommitId()
    } catch (error) {
      winston.error('ERROR: ' + error)
    }

    res.setHeader('Content-Type', 'application/json')
    let obj = {
      'Build': buildNumber,
      'Commit': commitId,
      'CurrentServerTime': Date.now()
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

// Create the HeroRouter, and export its configured Express.Router
const indexRoutes = new IndexRouter()
indexRoutes.init()

export default indexRoutes.router
