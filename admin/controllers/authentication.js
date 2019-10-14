'use strict'

const logger = require('../services/log.service').getLogger()
const homeRoutes = require('../lib/consts/home-routes')
const authModes = require('../lib/consts/auth-modes')
const config = require('../config')
const bluebird = require('bluebird')
const jwt = bluebird.promisifyAll(require('jsonwebtoken'))
const request = require('async-request')
const roleService = require('../services/role.service')
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

const createJwtForDfeApi = async () => {
  const clientId = config.Auth.dfeSignIn.clientId
  const apiSecret = config.Auth.dfeSignIn.userInfoApi.apiSecret
  const payload = {
    iss: clientId,
    aud: config.Auth.dfeSignIn.userInfoApi.audience
  }
  return jwt.sign(payload, apiSecret, { algorithm: 'HS256' })
}

const getUserInfoFromDfeApi = async (token, user) => {
  const serviceId = config.Auth.dfeSignIn.clientId // serves as serviceId also, undocumented
  const orgId = user.organisation.id
  const baseUrl = config.Auth.dfeSignIn.userInfoApi.baseUrl
  const url = `${baseUrl}/services/${serviceId}/organisations/${orgId}/users/${user.id}`
  const response = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (response.statusCode === 200) {
    return JSON.parse(response.body)
  } else {
    logger.error(response)
    throw new Error(`unsatisfactory response returned from DfE API. statusCode:${response.statusCode}`)
  }
}

const postDfeSignIn = async (req, res) => {
  logger.debug('## req.user ##')
  logger.debug(JSON.stringify(req.user, null, 2))
  try {
    // get role info...
    const token = await createJwtForDfeApi()
    const userInfo = await getUserInfoFromDfeApi(token, req.user)
    logger.debug('## userInfo from API ##')
    logger.debug(JSON.stringify(userInfo, null, 2))
    // TODO array check
    const mtcRole = roleService.mapDfeRoleToMtcRole(userInfo.roles[0].code)
    req.user.role = mtcRole
    logger.debug(`user role is ${req.user.role}`)
    logger.info(`postSignIn: User ID logged in: ${req.user.displayName} (${req.user.id})
    timezone is "${req.user.timezone}"`)
  } catch (error) {
    throw new Error(`unable to resolve dfe user:${error.message}`)
  }

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
    switch (config.Auth.mode) {
      case authModes.ncaTools:
        res.redirect(config.Auth.ncaTools.authUrl)
        break
      case authModes.dfeSignIn:
        getDfeSignOut(req, res)
        break
      default: //  local
        res.render('/')
        break
    }
  })
}

const getDfeSignOut = (req, res) => {
  if (req.user && req.user.id_token) {
    logger.audit('User logged out', {
      type: 'Sign-out',
      userId: req.user.sub,
      email: req.user.email,
      client: 'profiles'
    })
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
