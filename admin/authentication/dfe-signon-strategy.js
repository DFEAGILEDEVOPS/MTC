'use strict'

const config = require('../config')
const { Strategy, Issuer } = require('openid-client')
const logger = require('../services/log.service').getLogger()
const asyncRetry = require('login.dfe.async-retry')

const initSignOn = async () => {
  Issuer.defaultHttpOptions = { timeout: 10000 }
  const issuer = await asyncRetry(async () => Issuer.discover(config.DfeSignOn.authUrl), asyncRetry.strategies.apiStrategy)

  const client = new issuer.Client({
    client_id: config.DfeSignOn.clientId,
    client_secret: config.DfeSignOn.clientSecret
  })
  if (config.DfeSignOn.clockTolerance && config.DfeSignOn.clockTolerance > 0) {
    client.CLOCK_TOLERANCE = config.DfeSignOn.clockTolerance
  }

  return new Strategy({
    client,
    params: {
      // redirect_uri: `//${config.hostingEnvironment.host}:${config.PORT}/auth/cb`,
      scope: 'openid profile email'
    }
  }, (tokenset, authUserInfo, done) => {
    client.userinfo(tokenset.access_token)
      .then((userInfo) => {
        userInfo.id = userInfo.sub
        userInfo.name = userInfo.sub
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
