'use strict'

const config = require('../../config')
const logger = require('../log.service').getLogger()
const request = require('async-request')
const bluebird = require('bluebird')
const jwt = bluebird.promisifyAll(require('jsonwebtoken'))

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
      logger.error(`unable to get dfe role for user:${user.id} error:${error.message}`)
      throw error
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

/**
 * @description creates a JWT signed with the api secret using the HS256 algorithm.
 * @returns {Promise<string>} the signed Json Web Token
 */
const createJwtForDfeApi = async () => {
  const clientId = config.Auth.dfeSignIn.clientId
  const apiSecret = config.Auth.dfeSignIn.userInfoApi.apiSecret
  const payload = {
    iss: clientId,
    aud: config.Auth.dfeSignIn.userInfoApi.audience
  }
  return jwt.sign(payload, apiSecret, { algorithm: 'HS256' })
}

module.exports = service
