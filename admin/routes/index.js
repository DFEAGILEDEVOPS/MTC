const express = require('express')
const router = express.Router()
const passport = require('passport')
const R = require('ramda')

const config = require('../config')
const logger = require('../services/log.service').getLogger()
const isAuthenticated = require('../authentication/middleware')
const { getContactPage } = require('../controllers/contact')
const { getCookiesForm, getCookiesMtc } = require('../controllers/cookies')
const { getAccessibilityStatementPage } = require('../controllers/accessibility-statement')
const { getServiceManagerHome } = require('../controllers/service-manager')
const testDeveloperController = require('../controllers/test-developer')
const keepAliveController = require('../controllers/keep-alive')
const roles = require('../lib/consts/roles')
const authModes = require('../lib/consts/auth-modes')
const {
  home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getUnauthorised,
  getSignedOut
} = require('../controllers/authentication')
const getPing = require('../controllers/ping')
const getTestError = require('../controllers/test-error')

/* GET home page. */
router.get('/', (req, res) => home(req, res))
/* Login page */
router.get('/sign-in', (req, res) => getSignIn(req, res))
/* signed out (dfe signin only) */
router.get('/sign-out-dso', (req, res) => getSignedOut(req, res))
/* Sign out */
router.get('/sign-out', isAuthenticated(R.values(roles)), (req, res) => getSignOut(req, res))
/* Sign in failure */
router.get('/sign-in-failure', (req, res) => getSignInFailure(req, res))
/* Unauthorised */
router.get('/unauthorised', (req, res) => getUnauthorised(req, res))
/* Test developer routing */
router.get('/test-developer', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getTestDeveloperHomePage(req, res, next))
/* Service manager routing */
router.get('/service-manager', isAuthenticated(roles.serviceManager), (req, res, next) => getServiceManagerHome(req, res, next))
/* Contact page */
router.get('/contact', (req, res) => getContactPage(req, res))
/* Cookies page */
router.get('/cookies-form', (req, res) => getCookiesForm(req, res))
router.get('/cookies-mtc', (req, res) => getCookiesMtc(req, res))
/* Accessibility statement */
router.get('/accessibility-statement', (req, res) => getAccessibilityStatementPage(req, res))

router.get('/ping', (req, res) => getPing(req, res))
router.get('/test-error', (req, res) => getTestError(req, res))
router.get('/keep-alive', keepAliveController.keepAlive)

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

/* Dfe Sign-in */

if (config.Auth.mode === authModes.dfeSignIn) {
  router.get('/auth-dso',
    (req, res, next) => {
      const error = req.query.error
      if (error === 'sessionexpired') {
        // The DFE-Signin server has detected a stale session and redirected the user back to us.  This can be
        // caused by bookmarking the sign-in page (on Dfe Sign-in) which includes the session in the URL.  The
        // solution here is to force the sign-in server to regenerate the session.
        logger.info('DfeSignIn authentication: stale session detected. Redirecting.')
        return res.redirect(302, '/')
      }
      next()
    },
    passport.authenticate(authModes.dfeSignIn, { failureRedirect: signInFailureRedirect }),
    (req, res) => postSignIn(req, res)
  )
  router.get('/oidc-sign-in', passport.authenticate(authModes.dfeSignIn,
    { successRedirect: '/', failureRedirect: signInFailureRedirect }))
}

module.exports = router
