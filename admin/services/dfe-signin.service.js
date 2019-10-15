'use strict'

const config = require('./../config')
const request = require('async-request')
const bluebird = require('bluebird')
const logger = require('../services/log.service').getLogger()
const jwt = bluebird.promisifyAll(require('jsonwebtoken'))
const roleService = require('./role.service')
const schoolDataService = require('./data-access/school.data.service')
const userDataService = require('./data-access/user.data.service')
const { MtcHelpdeskImpersonationError } = require('../error-types/mtc-error')

const service = {
  /**
   * @description completes user sign in after DfE callback received.
   * @param {object} user the express request.user object
   * @returns {object} an updated user object with role populated
   */
  getRoleInfo: async (user) => {
    try {
      // get role info...
      const token = await createJwtForDfeApi()
      const userInfo = await getUserInfoFromDfeApi(token, user)
      logger.debug('response received from dfe.API:')
      logger.debugObject(userInfo)
      // TODO array check
      const mtcRole = roleService.mapDfeRoleToMtcRole(userInfo.roles[0].code)
      user.role = mtcRole
      return user
    } catch (error) {
      throw new Error(`unable to perform post authentication user initialisation:${error.message}`)
    }
  },
  /**
   * @description maps an authenticated NCA Tools user to an MTC user, school and role
   * @param {object} dfeUser all decrypted user information sent in the request payload
   */
  mapDfeUserToMtcUser: async (dfeUser) => {
    if (!dfeUser) {
      throw new Error('dfeUser argument required')
    }
    // TODO persist nca tools session token (best place might be adminLogonEvent?

    let school
    if (dfeUser.School) {
      // TODO
      school = await schoolDataService.sqlFindOneByUrn(dfeUser.organisation.urn)
    } else {
      throw new MtcHelpdeskImpersonationError('No organisation provided by DfE signin')
    }

    let userRecord = await userDataService.sqlFindOneByIdentifier(dfeUser.externalAuthenticationId)
    if (!userRecord) {
      const mtcRoleName = roleService.mapNcaRoleToMtcRole(dfeUser.UserType, school)
      const role = await roleService.findByTitle(mtcRoleName)
      const user = {
        identifier: dfeUser.externalAuthenticationId,
        displayName: dfeUser.EmailAddress,
        role_id: role.id
      }
      if (school) {
        user.school_id = school.id
      }
      await userDataService.sqlCreate(user)
      userRecord = await userDataService.sqlFindOneByIdentifier(dfeUser.externalAuthenticationId)
      if (!userRecord) {
        throw new Error('unable to find user record')
      }
    } else {
      // user exists - check requested school
      if (school && (userRecord.school_id !== school.id)) {
        await userDataService.sqlUpdateSchool(userRecord.id, school.id)
        userRecord = await userDataService.sqlFindOneByIdentifier(dfeUser.externalAuthenticationId)
      }
    }
    userRecord.mtcRole = roleService.mapNcaRoleToMtcRole(dfeUser.UserType, school)
    return userRecord
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

module.exports = service
