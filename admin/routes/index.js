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
const { home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getUnauthorised } = require('../controllers/authentication')
const getPing = require('../controllers/ping')

/* GET home page. */
router.get('/', (req, res) => home(req, res))
/* Login page */
router.get('/sign-in', (req, res) => getSignIn(req, res))

/* Login validation */
router.post('/sign-in',
  (req, res, next) => {
    next()
  },
  passport.authenticate(config.Auth.mode, { failureRedirect: '/sign-in-failure' }),
  (req, res) => postSignIn(req, res)
)

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

/* NCA Tools or DfeSignIn Authentication Endpoint */
router.post('/auth',
  function (req, res, next) {
    // Only allow post requests if not in local auth mode
    if (config.Auth.mode === authModes.local) {
      return res.status(404).send('Not found')
    }
    next()
  },
  passport.authenticate(config.Auth.mode, {
    failureRedirect: '/sign-in-failure'
  }), (req, res) => postSignIn(req, res)
)

module.exports = router
