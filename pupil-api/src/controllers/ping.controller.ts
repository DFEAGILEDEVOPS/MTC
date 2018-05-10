'use strict'

import { Request, Response } from 'express'
import * as path from 'path'
import * as fs from 'fs'
import * as moment from 'moment'

export class PingController {
  async getPing(req: Request, res: Response) {
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

  private getCommitId(): Promise<any> {
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

  private getBuildNumber(): Promise<any> {
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
