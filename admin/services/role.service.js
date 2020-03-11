'use strict'

const roleDataService = require('./data-access/role.data.service')
const roles = require('../lib/consts/roles')

const service = {
  /**
   * @param roleName required
   * @returns undefined or single role
   */
  findByTitle: async (roleTitle) => {
    if (!roleTitle) {
      throw new Error('roleTitle is required')
    }
    return roleDataService.sqlFindOneByTitle(roleTitle)
  },

  /**
   * Provides mapping of dfe sign-in roles to MTC roles.
   * @returns {string}
   */
  mapDfeRoleToMtcRole: (dfeRoleCode) => {
    const mapping = {
      mtc_service_manager: roles.serviceManager,
      mtc_headteacher: roles.teacher,
      mtc_teacher: roles.teacher,
      mtc_helpdesk: roles.helpdesk,
      mtc_test_developer: roles.testDeveloper
    }

    const role = mapping[dfeRoleCode]

    if (!role) {
      throw new Error(`Unknown dfe role ${dfeRoleCode}`)
    }
    return role
  }
}

module.exports = service
