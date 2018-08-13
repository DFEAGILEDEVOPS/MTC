'use strict'

const fs = require('fs')
const path = require('path')

module.exports = {
  getCommitId: () => {
    return new Promise(function (resolve, reject) {
      var commitFilePath = path.join(__dirname, '..', 'public', 'commit.txt')
      fs.readFile(commitFilePath, 'utf8', function (err, data) {
        if (!err) {
          resolve(data)
        } else {
          reject(new Error('NOT FOUND'))
        }
      })
    })
  },

  getBuildNumber: () => {
    // Promise wrapper function
    return new Promise(function (resolve, reject) {
      var buildFilePath = path.join(__dirname, '..', 'public', 'build.txt')
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
