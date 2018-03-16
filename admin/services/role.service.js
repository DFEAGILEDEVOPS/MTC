'use strict'

const roleDataService = require('./data-access/role.data.service')

const service = {
  /**
   * Provides mapping of NCA Tools 'UserType' string to MTC role.
   * @returns {string} Defaults to teacher if not found
   */
  mapNcaRoleToMtcRole: (ncaUserType, school = null) => {
    const mapping = {
      SuperAdmin: 'SERVICE-MANAGER',
      SuperUser: 'HEADTEACHER',
      SchoolSup: 'TEACHER',
      SchoolNom: 'TEACHER',
      Admin: 'HELPDESK',
      DataAdmin: 'TEST-DEVELOPER'
    }

    let role = mapping[ncaUserType]

    if (role === 'HELPDESK' && !school) {
      // There is no provision for helpdesk users to log on as themselves
      throw new Error('Helpdesk users must impersonate a school to sign-in')
    }

    if ((role === 'HELPDESK' || role === 'SERVICE-MANAGER') && school) {
      // The user is logging on as a school
      role = 'TEACHER'
    }

    return role || 'TEACHER'
  },
  /**
   * @param roleName required
   * @returns undefined or single role
   */
  findByTitle: async (roleTitle) => {
    if (!roleTitle) {
      throw new Error('roleTitle is required')
    }
    return roleDataService.sqlFindOneByTitle(roleTitle)
  }
}

module.exports = service
