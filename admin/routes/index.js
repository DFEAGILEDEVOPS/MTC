const express = require('express')
const router = express.Router()
const passport = require('passport')
const path = require('path')
const fs = require('fs')

const config = require('../config')
const isAuthenticated = require('../authentication/middleware')
const { getAdministration } = require('../controllers/administrator')
const { home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getProfile,
  postAuth,
  getUnauthorised } = require('../controllers/authentication')

/* GET home page. */
router.get('/', (req, res) => home(req, res))
/* Login page */
router.get('/sign-in', (req, res) => getSignIn(req, res))
/* Login validation */
router.post('/sign-in', (req, res, next) => {
  // Only allow post requests if NCA TOOLS is disabled
  if (config.NCA_TOOLS_AUTH_URL) {
    return res.status(404).send('Not found')
  }
  next()
}, passport.authenticate('local', { failureRedirect: '/sign-in-failure' }),
  (req, res) => postSignIn(req, res)
)
/* Sign out */
router.get('/sign-out', isAuthenticated(), (req, res) => getSignOut(req, res))
/* Sign in failure */
router.get('/sign-in-failure', (req, res) => getSignInFailure(req, res))
/* Unauthorised */
router.get('/unauthorised', (req, res) => getUnauthorised(req, res))
/* Profile page */
router.get('/profile', isAuthenticated(), (req, res) => getProfile(req, res))
/* Administration page */
router.get('/administrator', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res) => getAdministration(req, res))
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

/* NCA Tools Authentication Endpoint */
router.post('/auth',
  function (req, res, next) {
    // Only allow post requests if NCA TOOLS is enabled
    if (!config.NCA_TOOLS_AUTH_URL) {
      return res.status(404).send('Not found')
    }
    next()
  },
  passport.authenticate('custom', {
    failureRedirect: '/sign-in-failure'
  }), (req, res) => postAuth(req, res)
)

module.exports = router
