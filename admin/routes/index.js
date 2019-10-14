const express = require('express')
const router = express.Router()
const passport = require('passport')
const R = require('ramda')

const config = require('../config')
const isAuthenticated = require('../authentication/middleware')
const { getContactPage } = require('../controllers/contact')
const { getPrivacyPage } = require('../controllers/privacy')
const { getCookiesPage } = require('../controllers/cookies')
const { getAccessibilityStatementPage } = require('../controllers/accessibility-statement')
const { getServiceManagerHome } = require('../controllers/service-manager')
const checkFormController = require('../controllers/check-form')
const roles = require('../lib/consts/roles')
const authModes = require('../lib/consts/auth-modes')
const { home, getSignIn, postSignIn, getSignOut, getSignInFailure, getUnauthorised, postDfeSignIn } = require('../controllers/authentication')
const getPing = require('../controllers/ping')

/* GET home page. */
router.get('/', (req, res) => home(req, res))
/* Login page */
router.get('/sign-in', (req, res) => getSignIn(req, res))

/* Sign out */
router.get('/sign-out', isAuthenticated(R.values(roles)), (req, res) => getSignOut(req, res))
/* Sign in failure */
router.get('/sign-in-failure', (req, res) => getSignInFailure(req, res))
/* Unauthorised */
router.get('/unauthorised', (req, res) => getUnauthorised(req, res))
/* Test developer routing */
router.get('/test-developer', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.getTestDeveloperHomePage(req, res, next))
/* Service manager routing */
router.get('/service-manager', isAuthenticated(roles.serviceManager), (req, res, next) => getServiceManagerHome(req, res, next))
/* Contact page */
router.get('/contact', (req, res) => getContactPage(req, res))
router.get('/privacy', (req, res) => getPrivacyPage(req, res))
/* Cookies page */
router.get('/cookies', (req, res) => getCookiesPage(req, res))
/* ccessibility statement */
router.get('/accessibility-statement', (req, res) => getAccessibilityStatementPage(req, res))

router.get('/ping', (req, res) => getPing(req, res))

const signInFailureRedirect = '/sign-in-failure'

/* Local login submission */
if (config.Auth.mode === authModes.local) {
  router.post('/sign-in',
    (req, res, next) => {
      next()
    },
    passport.authenticate(config.Auth.mode, { failureRedirect: signInFailureRedirect }),
    (req, res) => postSignIn(req, res)
  )
}

/* federated auth callbacks */

<<<<<<< HEAD
/* NCA Tools */
if (config.Auth.mode === authModes.ncaTools) {
  router.post('/auth',
    function (req, res, next) {
      next()
    },
    passport.authenticate(authModes.ncaTools, {
      failureRedirect: signInFailureRedirect
    }), (req, res) => postSignIn(req, res)
  )
=======
  res.setHeader('Content-Type', 'application/json')
  const obj = {
    Build: buildNumber,
    Commit: commitId,
    CurrentServerTime: Date.now()
  }
  return res.status(200).send(obj)
>>>>>>> master
}

/* Dfe Sign-in */

if (config.Auth.mode === authModes.dfeSignIn) {
  router.get('/auth-dso',
    (req, res, next) => {
      next()
    },
    passport.authenticate(authModes.dfeSignIn, { failureRedirect: signInFailureRedirect }),
    (req, res) => postDfeSignIn(req, res)
  )
  router.get('/oidc-sign-in', passport.authenticate(authModes.dfeSignIn,
    { successRedirect: '/', failureRedirect: signInFailureRedirect }))
}

module.exports = router
