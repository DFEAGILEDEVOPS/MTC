'use strict'

const logger = require('../services/log.service').getLogger()
const homeRoutes = require('../lib/consts/home-routes')
const authModes = require('../lib/consts/auth-modes')
const config = require('../config')
const dfeSignInService = require('../services/dfe-signin.service')
const url = require('url')
const passport = require('passport')

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

const postDfeSignIn = async (req, res) => {
  req.user = await dfeSignInService.process(req.user)
  logger.info(`postSignIn: User ID logged in:
    id:${req.user.id} \n
    displayName:${req.user.displayName} \n
    role:${req.user.role} \n
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

const postSignIn = (req, res) => {
  logger.info(`postSignIn: User ID logged in:
    id:${req.user.id} \n
    displayName:${req.user.displayName} \n
    role:${req.user.role} \n
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
  if (config.Auth.mode === authModes.dfeSignIn) {
    getDfeSignOut(req, res)
  } else {
    req.logout()
  }

  req.session.regenerate(function () {
    switch (config.Auth.mode) {
      case authModes.ncaTools:
        return res.redirect(config.Auth.ncaTools.authUrl)
      case authModes.dfeSignIn:
        return res.redirect('/')
      default: //  local
        return res.redirect('/')
    }
  })
}

const getDfeSignOut = (req, res) => {
  if (req.user && req.user.id_token) {
    const idToken = req.user.id_token
    const issuer = passport._strategies[authModes.dfeSignIn]._issuer
    req.logout()
    const issuerEndSessionEndpoint = url.parse(issuer.end_session_endpoint)
    const urlObject = Object.assign(issuerEndSessionEndpoint, {
      query: {
        id_token_hint: idToken
      }
    })
    const theUrl = url.format(urlObject)
    res.redirect(theUrl)
  } else {
    res.redirect(req.query.redirect_uri ? req.query.redirect_uri : '/')
  }
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

module.exports = {
  home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getUnauthorised,
  postDfeSignIn
}
