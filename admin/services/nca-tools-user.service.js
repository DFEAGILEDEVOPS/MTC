'use strict'

const roleService = require('./role.service')
const schoolDataService = require('./data-access/school.data.service')
const userDataService = require('./data-access/user.data.service')

const service = {
  /**
   * @description maps an authenticated NCA Tools user to an MTC user, school and role
   * @param {object} ncaUser all decrypted user information sent in the request payload
   */
  mapNcaUserToMtcUser: async (ncaUser) => {
    if (!ncaUser) {
      throw new Error('ncaUser argument required')
    }
    // TODO persist nca tools session token (best place might be adminLogonEvent?)
    const school = await schoolDataService.sqlFindOneByDfeNumber(ncaUser.School)
    if (!school) {
      throw new Error('Unknown School')
    }

    let userRecord = await userDataService.sqlFindOneByIdentifier(ncaUser.UserName)
    if (!userRecord) {
      const mtcRoleName = roleService.mapNcaRoleToMtcRole(ncaUser.UserType)
      const role = await roleService.findByTitle(mtcRoleName)
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
      if (userRecord.school_id !== school.id) {
        userDataService.sqlUpdateSchool(userRecord.id, school.id)
      }
    }
    userRecord.mtcRole = roleService.mapNcaRoleToMtcRole(ncaUser.UserType)
    return userRecord
  }
}

module.exports = service
