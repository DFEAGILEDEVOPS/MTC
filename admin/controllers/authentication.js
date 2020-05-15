'use strict'

const logger = require('../services/log.service').getLogger()
const homeRoutes = require('../lib/consts/home-routes')
const authModes = require('../lib/consts/auth-modes')
const config = require('../config')
const url = require('url')
const roles = require('../lib/consts/roles')

const dfeSignInRedirect = '/oidc-sign-in'

const home = (req, res) => {
  if (req.isAuthenticated()) {
    switch (req.user.role) {
      case roles.teacher:
      case roles.helpdesk:
        return res.redirect(homeRoutes.schoolHomeRoute)
      case roles.testDeveloper:
        return res.redirect(homeRoutes.testDeveloperHomeRoute)
      case roles.serviceManager:
        return res.redirect(homeRoutes.serviceManagerHomeRoute)
      case roles.techSupport:
        return res.redirect(homeRoutes.techSupportHomeRoute)
    }
  } else {
    redirectToAuthModeSignIn(req, res)
  }
}

const redirectToAuthModeSignIn = (req, res) => {
  res.locals.pageTitle = 'Check Development - Login'
  switch (config.Auth.mode) {
    case authModes.dfeSignIn:
      res.redirect(dfeSignInRedirect)
      break
    default: //  local
      if (req.url === '/sign-in') {
        res.render('sign-in')
      } else {
        res.redirect('/sign-in')
      }
      break
  }
}

const getSignIn = (req, res) => {
  res.locals.pageTitle = 'Check Development - Login'
  if (req.isAuthenticated()) {
    home(req, res)
  } else {
    redirectToAuthModeSignIn(req, res)
  }
}

const postSignIn = (req, res) => {
  logger.info(`postSignIn: User ID logged in:
    id:${req.user.id}
    displayName:${req.user.displayName}
    role:${req.user.role}
    timezone:"${req.user.timezone}"`)
  return home(req, res)
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
    switch (config.Auth.mode) {
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
  res.locals.pageTitle = 'Access Unauthorised'
  res.statusCode = 401
  res.render('unauthorised')
}

const getSignedOut = (req, res) => {
  res.locals.pageTitle = 'Signed Out'
  res.render('signedout')
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
