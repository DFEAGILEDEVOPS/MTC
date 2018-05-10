'use strict'

import { Request, Response } from 'express'
import * as path from 'path'
import * as fs from 'fs'
import * as moment from 'moment'

const getPing: any = async (req: Request, res: Response) => {
  // get build number from /build.txt
  // get git commit from /commit.txt
  let buildNumber: object | string = 'NOT FOUND'
  let commitId: object | string = 'NOT FOUND'
  try {
    buildNumber = await getBuildNumber()
  } catch (error) {
    // error
  }

  try {
    commitId = await getCommitId()
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

const getCommitId = () => {
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

const getBuildNumber = () => {
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

export = getPing
