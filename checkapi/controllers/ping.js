'use strict'

const fs = require('fs')
const path = require('path')

module.exports = {
  get: getPing
}

/* Health check */
async function getPing (req, res, next) {
  // get build number from /build.txt
  // get git commit from /commit.txt
  let buildNumber = 'NOT FOUND'
  let commitId = 'NOT FOUND'
  try {
    buildNumber = await getBuildNumber()
  } catch (error) {

  }

  try {
    commitId = await getCommitId()
  } catch (error) {

  }

  res.setHeader('Content-Type', 'application/json')
  let obj = {
    'Build': buildNumber,
    'Commit': commitId,
    'CurrentServerTime': Date.now()
  }
  return res.status(200).send(obj)
}

function getCommitId () {
  return new Promise(function (resolve, reject) {
    var commitFilePath = path.join(__dirname, '..', 'commit.txt')
    fs.readFile(commitFilePath, 'utf8', function (err, data) {
      if (!err) {
        resolve(data)
      } else {
        reject(new Error('NOT FOUND'))
      }
    })
  })
}

function getBuildNumber () {
  // Promise wrapper function
  return new Promise(function (resolve, reject) {
    var buildFilePath = path.join(__dirname, '..', 'build.txt')
    fs.readFile(buildFilePath, 'utf8', function (err, data) {
      if (!err) {
        resolve(data)
      } else {
        reject(new Error('NOT FOUND'))
      }
    })
  })
}
