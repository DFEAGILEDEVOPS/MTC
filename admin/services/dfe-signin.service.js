'use strict'

const config = require('./../config')
const request = require('async-request')
const bluebird = require('bluebird')
const logger = require('../services/log.service').getLogger()
const jwt = bluebird.promisifyAll(require('jsonwebtoken'))
const roleService = require('./role.service')

/**
 * @description completes user sign in after DfE callback received.
 * @param {object} user the express request.user object
 * @returns {object} an updated user object with role populated
 */
const toExport = async (user) => {
  try {
    // get role info...
    const token = await createJwtForDfeApi()
    const userInfo = await getUserInfoFromDfeApi(token, user)
    // TODO array check
    const mtcRole = roleService.mapDfeRoleToMtcRole(userInfo.roles[0].code)
    user.role = mtcRole
    return user
  } catch (error) {
    throw new Error(`unable to perform post authentication user initialisation:${error.message}`)
  }
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

const createJwtForDfeApi = async () => {
  const clientId = config.Auth.dfeSignIn.clientId
  const apiSecret = config.Auth.dfeSignIn.userInfoApi.apiSecret
  const payload = {
    iss: clientId,
    aud: config.Auth.dfeSignIn.userInfoApi.audience
  }
  return jwt.sign(payload, apiSecret, { algorithm: 'HS256' })
}

module.exports = {
  process: toExport
}
