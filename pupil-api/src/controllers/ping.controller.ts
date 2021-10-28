import { Request, Response } from 'express'
import * as path from 'path'
import * as fs from 'fs'
import * as moment from 'moment'

export class PingController {
  async getPing (req: Request, res: Response): Promise<Response<any, Record<string, any>>> {
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
    const obj = {
      Build: buildNumber,
      Commit: commitId,
      CurrentServerTime: moment().toISOString()
    }
    return res.status(200).send(obj)
  }

  public async getCommitId (): Promise<any> {
    return new Promise(function (resolve, reject) {
      const commitFilePath = path.join(__dirname, '..', 'commit.txt')
      fs.readFile(commitFilePath, 'utf8', function (err, data) {
        if (err == null) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
  }

  public async getBuildNumber (): Promise<any> {
    // Promise wrapper function
    return new Promise(function (resolve, reject) {
      const buildFilePath = path.join(__dirname, '..', 'build.txt')
      fs.readFile(buildFilePath, 'utf8', function (err, data) {
        if (err == null) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
  }
}
