'use strict'

const roleService = require('./role.service')
const schoolDataService = require('./data-access/school.data.service')
const userDataService = require('./data-access/user.data.service')
const ncaToolsDataService = require('./data-access/nca-tools-session.data.service')

const service = {
  /**
   * @description maps an authenticated NCA Tools user to an MTC user, school and role
   * @param {object} ncaUser all decrypted user information sent in the request payload
   */
  mapNcaUserToMtcUser: async (ncaUser) => {
    if (!ncaUser) {
      throw new Error('ncaUser argument required')
    }
    // TODO persist nca tools session token (best place might be adminLogonEvent?

    let school
    if (ncaUser.School) {
      school = await schoolDataService.sqlFindOneByDfeNumber(ncaUser.School)
      if (!school) {
        throw new Error(`Unknown School:${ncaUser.School}`)
      }
    }

    let userRecord = await userDataService.sqlFindOneByIdentifier(ncaUser.EmailAddress)
    if (!userRecord) {
      const mtcRoleName = roleService.mapNcaRoleToMtcRole(ncaUser.UserType)
      const role = await roleService.findByTitle(mtcRoleName)
      const user = {
        identifier: ncaUser.EmailAddress,
        role_id: role.id
      }
      if (school) {
        user.school_id = school.id
      }
      await userDataService.sqlCreate(user)
      userRecord = await userDataService.sqlFindOneByIdentifier(ncaUser.EmailAddress)
      if (!userRecord) {
        throw new Error('unable to find user record')
      }
    } else {
      // user exists - check requested school
      if (school && (userRecord.school_id !== school.id)) {
        await userDataService.sqlUpdateSchool(userRecord.id, school.id)
      }
    }
    userRecord.mtcRole = roleService.mapNcaRoleToMtcRole(ncaUser.UserType)
    return userRecord
  },
  recordLogonAttempt: async (logonData) => {
    if (!(logonData && logonData.sessionToken && logonData.userName)) {
      throw new Error('missing arguments')
    }
    return ncaToolsDataService.sqlCreate(logonData)
  }
}

module.exports = service
