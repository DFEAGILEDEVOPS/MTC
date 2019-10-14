'use strict'

const logger = require('../services/log.service').getLogger()
const homeRoutes = require('../lib/consts/home-routes')
const authModes = require('../lib/consts/auth-modes')
const config = require('../config')
const dfeSignInService = require('../services/dfe-signin.service')
const url = require('url')
const passport = require('passport')

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
        return res.redirect('/oidc-sign-in')
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
      res.redirect('/oidc-sign-in')
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
  dfeSignInService.process(req.user)
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
  req.logout()
  if (config.Auth.Mode === authModes.dfeSignIn) {
    getDfeSignOut(req, res)
  }
  req.session.regenerate(function () {
    // session has been regenerated
    switch (config.Auth.mode) {
      case authModes.ncaTools:
        res.redirect(config.Auth.ncaTools.authUrl)
        break
      case authModes.dfeSignIn:
        // 🤷‍♂️
        logger.debug('session regen called')
        break
      default: //  local
        res.render('/')
        break
    }
  })
}

const getDfeSignOut = (req, res) => {
  if (req.user && req.user.id_token) {
    const idToken = req.user.id_token
    const issuer = passport._strategies.oidc._issuer
    // let returnUrl = `${config.hostingEnvironment.protocol}://${config.hostingEnvironment.host}:${config.hostingEnvironment.port}/signout/complete`
    // if (req.query.redirect_uri) {
    //   returnUrl = req.query.redirect_uri
    // }
    // req.logout()
    res.redirect(url.format(Object.assign(url.parse(issuer.end_session_endpoint), {
      search: null,
      query: {
        id_token_hint: idToken
        // post_logout_redirect_uri: returnUrl
      }
    })))
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
  getUnauthorised,
  postDfeSignIn
}
