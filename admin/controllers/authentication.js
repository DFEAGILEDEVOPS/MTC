'use strict'

const logger = require('../services/log.service').getLogger()
const homeRoutes = require('../lib/consts/home-routes')
const authModes = require('../lib/consts/auth-modes')
const config = require('../config')
const url = require('url')

const dfeSignInRedirect = '/oidc-sign-in'

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
    switch (config.Auth.mode) {
      case authModes.dfeSignIn:
        return res.redirect(dfeSignInRedirect)
      case authModes.ncaTools:
        return res.redirect(config.Auth.ncaTools.authUrl)
      default:
        return res.redirect('/sign-in')
    }
  }
}

const redirectToAuthModeSignIn = (res) => {
  switch (config.Auth.mode) {
    case authModes.ncaTools:
      res.redirect(dfeSignInRedirect)
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
  logger.info(`postSignIn: User ID logged in:
    id:${req.user.id}
    displayName:${req.user.displayName}
    role:${req.user.role}
    timezone:"${req.user.timezone}"`)

  switch (req.user.role) {
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
  let dfeSignOutUrl
  if (config.Auth.mode === authModes.dfeSignIn) {
    const dfeUrl = new url.URL(config.Auth.dfeSignIn.signOutUrl)
    dfeUrl.searchParams.append('id_token_hint', req.user.id_token)
    dfeUrl.searchParams.append('post_logout_redirect_uri', `${config.Runtime.externalHost}/sign-out-dso`)
    dfeSignOutUrl = dfeUrl.toString()
  }
  req.logout()

  req.session.regenerate(function () {
    logger.debug(`req.session.regenerate. Auth.mode:${config.Auth.mode}`)
    switch (config.Auth.mode) {
      case authModes.ncaTools:
        return res.redirect(config.Auth.ncaTools.authUrl)
      case authModes.dfeSignIn:
        return res.redirect(dfeSignOutUrl)
      default: //  local
        return res.redirect('/')
    }
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
    /*     case authModes.dfeSignIn:
      res.redirect(config.Auth.dfeSignIn.authUrl)
      break */
    default: //  local
      res.locals.pageTitle = 'Access Unauthorised'
      res.render('unauthorised')
      break
  }
}

const getSignedOut = (req, res) => {
  res.locals.pageTitle = 'Signed Out'
  res.render('signedOut')
}

module.exports = {
  home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getUnauthorised,
  getSignedOut
}
