'use strict'

const config = require('../config')
const { Strategy, Issuer } = require('openid-client')
const logger = require('../services/log.service').getLogger()
const asyncRetry = require('login.dfe.async-retry')
const dfeSigninService = require('../services/dfe-signin.service')
const passport = require('passport')
const authModes = require('../lib/consts/auth-modes')

/**
 * Asynchronous setup of DfE signin with retry strategy for issuer discovery
 * @returns {Strategy} configured Passport Strategy
 */
const initSignOnAsync = async () => {
  Issuer.defaultHttpOptions = { timeout: config.Auth.dfeSignIn.issuerDiscoveryTimeoutMs }
  let issuer
  try {
    issuer = await asyncRetry(async () =>
      Issuer.discover(config.Auth.dfeSignIn.issuerUrl), asyncRetry.strategies.apiStrategy)
  } catch (error) {
    logger.error(`error discovering dfe signin service:${error.message}`)
    throw error
  }
  logger.info('dfe sign on initialised')
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
      logger.error(error)
      done(error)
    }
  })
}

/**
 * Synchronous setup of DfE signin with no fault tolerance on issuer discovery.
 * Configures passport with strategy once created
 * @returns {void}
 */
const initSignOnSync = () => {
  Issuer.defaultHttpOptions = { timeout: config.Auth.dfeSignIn.issuerDiscoveryTimeoutMs }
  logger.debug('discovering dfe signin service issuer...')
  Issuer.discover(config.Auth.dfeSignIn.issuerUrl)
    .then((issuer) => {
      logger.info('dfe sign on discovered successfully')
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
          done(error)
        }
      })
      passport.use(authModes.dfeSignIn, dfeStrategy)
    })
    .catch((error) => {
      logger.error(`dfe signin initialisation failed:${error.message}`)
      throw error
    })
}

module.exports = {
  initialise: initSignOnSync,
  initialiseAsync: initSignOnAsync
}
