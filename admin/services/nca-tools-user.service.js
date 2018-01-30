'use strict'

const roleService = require('./role.service')
const schoolDataService = require('./data-access/school.data.service')
const userDataService = require('./data-access/user.data.service')

const service = {
  /**
   * @description maps an authenticated NCA Tools user to an MTC user, school and role
   * @param {object} ncaUser all decrypted user information sent in the request payload
   * @param {object} requestData information about the request and session
   */
  mapNcaUserToMtcUser: async (ncaUser) => {
    // TODO persist nca tools session token (best place might be adminLogonEvent?)
    let userRecord = await userDataService.sqlFindOneByIdentifier(ncaUser.UserName)
    if (!userRecord) {
      const mtcRoleName = roleService.mapNcaRoleToMtcRole(ncaUser.UserType)
      const role = await roleService.findByTitle(mtcRoleName)
      const school = await schoolDataService.sqlFindOneByDfeNumber(ncaUser.School)
      if (!school) {
        throw new Error('Unknown School')
      }
      const user = {
        identifier: ncaUser.UserName,
        school_id: school.id,
        role_id: role.id
      }
      await userDataService.sqlCreate(user)
      userRecord = await userDataService.sqlFindOneByIdentifier(ncaUser.UserName)
      if (!userRecord) {
        throw new Error('unable to find user record')
      }
    } else {
      // user exists - check requested school
      const ncaSchool = await schoolDataService.sqlFindOneByDfeNumber(ncaUser.School)
      if (!ncaSchool) {
        throw new Error('Unknown School')
      }
      if (userRecord.school_id !== ncaSchool.id) {
        userDataService.sqlUpdateSchool(userRecord.id, ncaSchool.id)
      }
    }
    userRecord.mtcRole = roleService.mapNcaRoleToMtcRole(ncaUser.UserType)
    return userRecord
  }
}

module.exports = service
