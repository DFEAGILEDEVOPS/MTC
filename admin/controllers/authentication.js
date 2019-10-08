'use strict'

const logger = require('../services/log.service').getLogger()
const homeRoutes = require('../lib/consts/home-routes')
const authModes = require('../lib/consts/auth-modes')
const config = require('../config')

const home = (req, res) => {
  if (req.isAuthenticated()) {
    switch (req.user.role) {
      case 'TEACHER':
      case 'HEADTEACHER':
        return res.redirect(homeRoutes.schoolHomeRoute)
      case 'TEST-DEVELOPER':
        return res.redirect(homeRoutes.testDeveloperHomeRoute)
      case 'SERVICE-MANAGER':
        return res.redirect(homeRoutes.serviceManagerHomeRoute)
      case 'HELPDESK':
        return res.redirect(homeRoutes.schoolHomeRoute)
    }
  } else {
    res.redirect('/sign-in')
  }
}

const redirectToAuthModeSignIn = (res) => {
  switch (config.Auth.mode) {
    case authModes.ncaTools:
      res.redirect(config.Auth.ncaTools.authUrl)
      break
    case authModes.dfeSignIn:
      res.redirect(config.Auth.dfeSignIn.authUrl)
      break
    default: //  local
      res.render('sign-in')
      break
  }
}

const getSignIn = (req, res) => {
  res.locals.pageTitle = 'Check Development - Login'
  if (req.isAuthenticated()) {
    res.redirect('/school/school-home')
  } else {
    redirectToAuthModeSignIn(res)
  }
}

const postSignIn = (req, res) => {
  // Only id is available from local and NCA auth
  const { displayName, id, role, timezone } = req.user
  logger.info(`postSignIn: User ID logged in: ${id} (${displayName}) timezone is "${timezone}"`)

  switch (role) {
    case 'TEACHER':
    case 'HEADTEACHER':
    case 'HELPDESK':
      return res.redirect(homeRoutes.schoolHomeRoute)
    case 'TEST-DEVELOPER':
      return res.redirect(homeRoutes.testDeveloperHomeRoute)
    case 'SERVICE-MANAGER':
      return res.redirect(homeRoutes.serviceManagerHomeRoute)
    default:
      return res.redirect(homeRoutes.schoolHomeRoute)
  }
}

const getSignOut = (req, res) => {
  req.logout()
  req.session.regenerate(function () {
    // session has been regenerated
    redirectToAuthModeSignIn(res)
  })
}

const getSignInFailure = (req, res) => {
  res.locals.pageTitle = 'Check Development App - Sign-in error'
  res.render('sign-in-failure')
}

const getUnauthorised = (req, res) => {
  switch (config.Auth.mode) {
    case authModes.ncaTools:
      res.redirect(config.Auth.ncaTools.authUrl)
      break
    case authModes.dfeSignIn:
      res.redirect(config.Auth.dfeSignIn.authUrl)
      break
    default: //  local
      res.locals.pageTitle = 'Access Unauthorised'
      res.render('unauthorised')
      break
  }
}

module.exports = {
  home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getUnauthorised
}
