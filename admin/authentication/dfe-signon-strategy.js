'use strict'

const config = require('../config')
const { Strategy, Issuer } = require('openid-client')
const logger = require('../services/log.service').getLogger()
const asyncRetry = require('login.dfe.async-retry')

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
  }, (tokenset, authUserInfo, done) => {
    logger.debug('strategy callback fired.')
    logger.debug('## tokenset ##')
    logger.debug(JSON.stringify(tokenset, null, 2))
    logger.debug('## authUserInfo ##')
    logger.debug(JSON.stringify(authUserInfo, null, 2))
    client.userinfo(tokenset.access_token)
      .then((userInfo) => {
        userInfo.id = userInfo.sub
        userInfo.displayName = `${userInfo.given_name} ${userInfo.family_name} (${userInfo.email})`
        userInfo.id_token = tokenset.id_token
        done(null, userInfo)
      })
      .catch((err) => {
        logger.error(err)
        done(err)
      })
  })
}

module.exports = initSignOn
