const express = require('express')
const router = express.Router()
const passport = require('passport')

const { getCommitId, getBuildNumber } = require('../helpers/healthcheck')
const config = require('../config')
const rolesConfig = require('../roles-config')
const isAuthenticated = require('../authentication/middleware')
const { getContactPage } = require('../controllers/contact')
const { getPrivacyPage } = require('../controllers/privacy')
const { getCookiesPage } = require('../controllers/cookies')
const { getServiceManagerHome } = require('../controllers/service-manager')
const checkFormController = require('../controllers/check-form')
const { home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getUnauthorised } = require('../controllers/authentication')

/* GET home page. */
router.get('/', (req, res) => home(req, res))
/* Login page */
router.get('/sign-in', (req, res) => getSignIn(req, res))

/* Login validation */
const passportStrategy = config.NCA_TOOLS_AUTH_URL && config.NCA_TOOLS_AUTH_URL.length > 0 ? 'custom' : 'local'
router.post('/sign-in',
  (req, res, next) => {
    next()
  },
  passport.authenticate(passportStrategy, { failureRedirect: '/sign-in-failure' }),
  (req, res) => postSignIn(req, res)
)

/* Sign out */
router.get('/sign-out', isAuthenticated(), (req, res) => getSignOut(req, res))
/* Sign in failure */
router.get('/sign-in-failure', (req, res) => getSignInFailure(req, res))
/* Unauthorised */
router.get('/unauthorised', (req, res) => getUnauthorised(req, res))
/* Test developer routing */
router.get('/test-developer', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getTestDeveloperHomePage(req, res, next))
/* Service manager routing */
router.get('/service-manager', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => getServiceManagerHome(req, res, next))
/* Contact page */
router.get('/contact', (req, res) => getContactPage(req, res))
router.get('/privacy', (req, res) => getPrivacyPage(req, res))
/* Cookies page */
router.get('/cookies', (req, res) => getCookiesPage(req, res))
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
  }), (req, res) => postSignIn(req, res)
)

module.exports = router
