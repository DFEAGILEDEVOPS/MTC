'use strict'

const fs = require('fs')
const path = require('path')

let cachedCommitId
let cachedCommitIdExpiresAt
let cachedBuildNumber
let cachedBuildNumberExpiresAt

module.exports = {
  getCommitId: async (cacheBust = false) => {
    const now = Date.now()
    const readCommitIdFromFileAsync = new Promise(function (resolve, reject) {
      const commitFilePath = path.join(__dirname, '..', 'public', 'commit.txt')
      fs.readFile(commitFilePath, 'utf8', function (err, data) {
        if (!err) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
    if (cacheBust || !cachedCommitId || !cachedCommitIdExpiresAt || now > cachedCommitIdExpiresAt) {
      cachedCommitId = await readCommitIdFromFileAsync
      cachedCommitIdExpiresAt = Date.now() + (60 * 1000) // +60 seconds
    }
    return cachedCommitId
  },

  getBuildNumber: async (cacheBust = false) => {
    const now = Date.now()
    const readBuildNumberFromFileAsync = new Promise(function (resolve, reject) {
      var buildFilePath = path.join(__dirname, '..', 'public', 'build.txt')
      fs.readFile(buildFilePath, 'utf8', function (err, data) {
        if (!err) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
    if (cacheBust || !cachedBuildNumber || !cachedBuildNumberExpiresAt || now > cachedBuildNumberExpiresAt) {
      cachedBuildNumber = await readBuildNumberFromFileAsync
      cachedCommitIdExpiresAt = Date.now() + (60 * 1000) // +60 seconds
    }
    return cachedBuildNumber
  }
}
