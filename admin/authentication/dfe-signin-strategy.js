'use strict'

const config = require('../config')
const { Strategy, Issuer } = require('openid-client')
const logger = require('../services/log.service').getLogger()
const asyncRetry = require('login.dfe.async-retry')
const dfeSigninService = require('../services/dfe-signin.service')
const passport = require('passport')
const authModes = require('../lib/consts/auth-modes')
const { DfeSignInError } = require('../error-types/dfe-signin-error')
const { DsiSchoolNotFoundError } = require('../error-types/DsiSchoolNotFoundError')
const { SystemUnavailableError } = require('../error-types/system-unavailable-error')
/**
 * Asynchronous setup of DfE signin with retry strategy for issuer discovery
 * @returns {Promise<Strategy>} configured Passport Strategy
 */
const initSignOnAsync = async () => {
  // @ts-ignore Still appears to be valid, even though undocumented - https://github.com/okta/okta-oidc-js/pull/126/files
  Issuer.defaultHttpOptions = { timeout: config.Auth.dfeSignIn.issuerDiscoveryTimeoutMs }
  let issuer
  try {
    issuer = await asyncRetry(async () =>
      Issuer.discover(config.Auth.dfeSignIn.issuerUrl), asyncRetry.strategies.apiStrategy)
  } catch (error) {
    const err = `Error discovering dfe signin service:${error.message}`
    logger.warn(err)
    throw new DfeSignInError(err, '', error)
  }
  logger.debug('dfe sign on initialised')
  const client = new issuer.Client({
    client_id: config.Auth.dfeSignIn.clientId,
    client_secret: config.Auth.dfeSignIn.clientSecret,
    post_logout_redirect_uri: `${config.Runtime.externalHost}/sign-out-dso`
  })
  if (config.Auth.dfeSignIn.clockToleranceSeconds && config.Auth.dfeSignIn.clockToleranceSeconds > 0) {
    client.CLOCK_TOLERANCE = config.Auth.dfeSignIn.clockToleranceSeconds
  }

  return new Strategy({
    client,
    params: {
      scope: config.Auth.dfeSignIn.openIdScope,
      redirect_uri: `${config.Runtime.externalHost}/auth-dso`
    }
  }, async (tokenset, authUserInfo, done) => {
    try {
      // authUserInfo appears to be exactly the same as what client.userinfo returns 🤷‍♂️
      // let userInfo = await client.userinfo(tokenset.access_token)
      const userInfo = await dfeSigninService.initialiseUser(authUserInfo, tokenset)
      done(null, userInfo)
    } catch (error) {
      const systemErrorMessage = `DfeSignIn: initSignOnAsync(): Error initializing user: ${error.message}`
      logger.error(systemErrorMessage)
      let userMessage = ''
      if (error instanceof DsiSchoolNotFoundError) {
        userMessage = error.message
      }
      // The SystemUnavailableError is generated from `initialiseUser` when the role is TEACHER and
      // the system is not available (as defined in the SM Settings page).  This is not a sign-on error
      // so we don't wrap it up as a DfeSIgnInError.  Instead, let app.js handle it and render the correct error
      // page. 
      if (error instanceof SystemUnavailableError) {
        done(SystemUnavailableError)
        return
      }
      const dfeSignInError = new DfeSignInError(systemErrorMessage, userMessage, error)
      done(dfeSignInError)
    }
  })
}

/**
 * Synchronous setup of DfE signin with no fault tolerance on issuer discovery.
 * Configures passport with strategy once created
 * @returns {void}
 */
const initSignOnSync = () => {
  // @ts-ignore Still appears to be valid, even though undocumented - https://github.com/okta/okta-oidc-js/pull/126/files
  Issuer.defaultHttpOptions = { timeout: config.Auth.dfeSignIn.issuerDiscoveryTimeoutMs }
  logger.debug('discovering dfe signin service issuer...')
  Issuer.discover(config.Auth.dfeSignIn.issuerUrl)
    .then((issuer) => {
      logger.debug('dfe sign on discovered successfully')
      const client = new issuer.Client({
        client_id: config.Auth.dfeSignIn.clientId,
        client_secret: config.Auth.dfeSignIn.clientSecret
      })
      if (config.Auth.dfeSignIn.clockToleranceSeconds && config.Auth.dfeSignIn.clockToleranceSeconds > 0) {
        client.CLOCK_TOLERANCE = config.Auth.dfeSignIn.clockToleranceSeconds
      }
      const dfeStrategy = new Strategy({
        client,
        params: {
          scope: config.Auth.dfeSignIn.openIdScope
        }
      }, async (tokenset, authUserInfo, done) => {
        try {
          // authUserInfo appears to be exactly the same as what client.userinfo returns 🤷‍♂️
          // let userInfo = await client.userinfo(tokenset.access_token)
          const userInfo = await dfeSigninService.initialiseUser(authUserInfo, tokenset)
          done(null, userInfo)
        } catch (error) {
          logger.error(error)
          if (error instanceof DfeSignInError) {
            done(error)
          }
          let userMessage = ''
          if (error instanceof DsiSchoolNotFoundError) {
            userMessage = error.message
          }
          done(new DfeSignInError('Dfe Sign-in: error initialising user', userMessage, error))
        }
      })
      passport.use(authModes.dfeSignIn, dfeStrategy)
    })
    .catch((error) => {
      logger.error(`dfe signin initialisation failed:${error.message}`)
      if (error instanceof DfeSignInError) {
        throw error
      }
      throw new DfeSignInError(error.message, undefined, error)
    })
}

module.exports = {
  initialise: initSignOnSync,
  initialiseAsync: initSignOnAsync
}
