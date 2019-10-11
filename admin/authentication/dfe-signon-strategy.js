'use strict'

const config = require('../config')
const { Strategy, Issuer } = require('openid-client')
const logger = require('../services/log.service').getLogger()
const asyncRetry = require('login.dfe.async-retry')

const initSignOn = async () => {
  Issuer.defaultHttpOptions = { timeout: 10000 }
  const issuer = await asyncRetry(async () => Issuer.discover(config.Auth.dfeSignIn.authUrl), asyncRetry.strategies.apiStrategy)
  logger.debug('discovered dfe.issuer:', issuer)
  const client = new issuer.Client({
    client_id: config.Auth.dfeSignIn.clientId,
    client_secret: config.Auth.dfeSignIn.clientSecret
  })
  if (config.Auth.dfeSignIn.clockTolerance && config.Auth.dfeSignIn.clockTolerance > 0) {
    client.CLOCK_TOLERANCE = config.Auth.dfeSignIn.clockTolerance
  }

  return new Strategy({
    client,
    params: {
      // redirect_uri: `http://localhost:3001/auth`,
      scope: 'openid profile email organisation'
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
