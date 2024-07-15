'use strict'

const config = require('../../config')
const logger = require('../log.service').getLogger()
const bluebird = require('bluebird')
const jwt = bluebird.promisifyAll(require('jsonwebtoken'))
const axios = require('axios')
const { DfeSignInError, dfeSignInErrorConsts } = require('../../error-types/dfe-signin-error')

const service = {
/**
 * @description completes user sign in after DfE callback received.
 * @param {object} user the express request.user object
 * @returns {Promise<string>} the unique role identifier
 */
  getDfeRole: async (user) => {
    try {
      const token = await createJwtForDfeApi()
      const userInfo = await getUserInfoFromDfeApi(token, user)
      return userInfo.roles[0].code
    } catch (error) {
      const err = `unable to get dfe role for user:${user.id} error:${error.message}`
      logger.error(err)
      const dfeSignInError = new DfeSignInError(err, 'Dfe Sign-in error: unable to determine role', error)
      dfeSignInError.code = dfeSignInErrorConsts.dfeRoleError
      throw dfeSignInError
    }
  }
}

/**
 * @description looks up user role information.
 * @param {string} token a JWT signed with the dfe API secret
 * @returns {Promise<object>} the user info object returned from the API
 */
const getUserInfoFromDfeApi = async (token, user) => {
  const serviceId = config.Auth.dfeSignIn.clientId // serves as serviceId also, undocumented
  const orgId = user.organisation.id
  const baseUrl = config.Auth.dfeSignIn.userInfoApi.baseUrl
  const apiUrl = `${baseUrl}/services/${serviceId}/organisations/${orgId}/users/${user.providerUserId}`

  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (response.status === 200) {
    return response.data
  } else {
    const err = `dfe API call failed: statusCode:${response.status} - ${response.statusText}`
    logger.error(err)
    throw new DfeSignInError(`unsatisfactory response returned from DfE API. statusCode:${response.status}`)
  }
}

/**
 * @description creates a JWT signed with the api secret using the HS256 algorithm.
 * @returns {Promise<string>} the signed Json Web Token
 */
const createJwtForDfeApi = () => {
  const clientId = config.Auth.dfeSignIn.clientId
  const apiSecret = config.Auth.dfeSignIn.userInfoApi.apiSecret
  const payload = {
    iss: clientId,
    aud: config.Auth.dfeSignIn.userInfoApi.audience
  }
  return jwt.signAsync(payload, apiSecret, { algorithm: 'HS256' })
}

module.exports = service
