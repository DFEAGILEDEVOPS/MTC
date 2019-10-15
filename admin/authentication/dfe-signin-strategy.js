'use strict'

const config = require('../config')
const { Strategy, Issuer } = require('openid-client')
const logger = require('../services/log.service').getLogger()
const asyncRetry = require('login.dfe.async-retry')
const dfeSigninService = require('../services/dfe-signin.service')

const initSignOn = async () => {
  Issuer.defaultHttpOptions = { timeout: config.Auth.dfeSignIn.issuerDiscoveryTimeoutMs }
  const issuer = await asyncRetry(async () =>
    Issuer.discover(config.Auth.dfeSignIn.authUrl), asyncRetry.strategies.apiStrategy)
  logger.info('dfe sign on initialised')
  const client = new issuer.Client({
    client_id: config.Auth.dfeSignIn.clientId,
    client_secret: config.Auth.dfeSignIn.clientSecret
  })
  if (config.Auth.dfeSignIn.clockToleranceSeconds && config.Auth.dfeSignIn.clockToleranceSeconds > 0) {
    client.CLOCK_TOLERANCE = config.Auth.dfeSignIn.clockToleranceSeconds
  }

  return new Strategy({
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
}
/*   return new Strategy({
    client,
    params: {
      scope: config.Auth.dfeSignIn.openIdScope
    }
  }, (tokenset, authUserInfo, done) => {
    client.userinfo(tokenset.access_token)
      .then((userInfo) => {
        userInfo = dfeSigninService.initialiseUser(userInfo, tokenset)
        done(null, userInfo)
      })
      .catch((err) => {
        logger.error(err)
        done(err)
      })
  })
} */

module.exports = initSignOn
