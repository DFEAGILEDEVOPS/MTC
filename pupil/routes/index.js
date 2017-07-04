const express = require('express')
const router = express.Router()
const { getHome,
  getLogger,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInSucess,
  getSignInFailure,
  getPing } = require('../controllers/pupil')

// const logger = require('../lib/logger')

/* GET home page. */
router.get('/', (req, res) => getHome(req, res))
/* GET Logger function */
router.get('/logger', (req, res) => getLogger(req, res))
/* Login page */
router.get('/sign-in', (req, res) => getSignIn(req, res))
/* Login validation */
router.post('/sign-in', (req, res) => postSignIn(req, res))
/* Sign out */
router.get('/sign-out', (req, res) => getSignOut(req, res))
router.get('/sign-in-success', (req, res) => getSignInSucess(req, res))
/* Sign in failure */
router.get('/sign-in-failure', (req, res) => getSignInFailure(req, res))
/* Health check */
router.get('/ping', (req, res) => getPing(req, res))

module.exports = router
