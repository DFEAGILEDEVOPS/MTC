const express = require('express')
const router = express.Router()
const passport = require('passport')
const isAuthenticated = require('../authentication/middleware')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.role === 'TEACHER' || req.user.role === 'HEADTEACHER') {
      return res.redirect('/school/school-home')
    } else {
      return res.redirect('/school/school-home')
    }
  } else {
    res.redirect('/sign-in')
  }
})

/* Login page */
router.get('/sign-in', function (req, res) {
  res.locals.pageTitle = 'Check Development - Login'
  if (req.isAuthenticated()) {
    res.redirect('/school/school-home')
  } else {
    if (process.env.NCA_TOOLS_AUTH_URL) {
      res.redirect(process.env.NCA_TOOLS_AUTH_URL)
    } else {
      res.render('sign-in')
    }
  }
})

/* Login validation */
router.post('/sign-in',
  function (req, res, next) {
    // Only allow post requests if NCA TOOLS is disabled
    if (process.env.NCA_TOOLS_AUTH_URL) {
      return res.status(404).send('Not found')
    }
    next()
  },
  passport.authenticate('local', {failureRedirect: '/sign-in-failure'}),
  function (req, res) {
    if (req.user.role === 'TEACHER' || req.user.role === 'HEADTEACHER') {
      return res.redirect('/school/school-home')
    }
    // There is no landing page for Test Developers yet.
    res.redirect('/school/school-home')
  }
)

/* Sign out */
router.get('/sign-out', isAuthenticated(), function (req, res) {
  req.logout()
  req.session.regenerate(function () {
    // session has been regenerated
    res.redirect('/')
  })
})

/* Sign in failure */
router.get('/sign-in-failure', function (req, res) {
  res.locals.pageTitle = 'Check Development App - Sign-in error'
  res.render('sign-in-failure')
})

/* Profile page */
router.get('/profile', isAuthenticated(), function (req, res) {
  res.locals.pageTitle = 'Check Development - Profile'
  res.render('profile')
})

/* Health check */
router.get('/ping', function (req, res) {
  res.status(200).send('OK')
})

/* NCA Tools Authentication Endpoint */
router.post('/auth',
  function (req, res, next) {
    // Only allow post requests if NCA TOOLS is enabled
    if (!process.env.NCA_TOOLS_AUTH_URL) {
      return res.status(404).send('Not found')
    }
    next()
  },
  passport.authenticate('custom', {
    failureRedirect: '/sign-in-failure'
  }),
  function (req, res) {
    // Please leave this in until we are confident we have identified all the NCA Tools roles.
    console.log(req.user)
    // Schools roles should redirect to school-home:
    // no mapping provided yet.
    return res.redirect('/school/school-home')
  }
)

module.exports = router
