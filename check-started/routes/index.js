const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

const { checkStarted } = require('../controllers/check-started')

/* Health check */
async function getPing (req, res) {
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
    var commitFilePath = path.join(__dirname, '..', 'public', 'commit.txt')
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

router.get('/ping', (req, res) => getPing(req, res))

/* check-started microservice */
router.route('/submit').all((req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  checkStarted(req, res)
})

module.exports = router
