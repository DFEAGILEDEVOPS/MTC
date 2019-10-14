'use strict'

const roleDataService = require('./data-access/role.data.service')
const { MtcSchoolMismatchError } = require('../error-types/mtc-error')

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
      SchoolNomAA: 'TEACHER',
      Admin: 'HELPDESK',
      AdminAA: 'HELPDESK',
      DataAdmin: 'TEST-DEVELOPER',
      SchoolNomAAMTC: 'TEACHER'
    }

    let role = mapping[ncaUserType]

    if (!role) {
      throw new Error(`Unknown ncaUserType ${ncaUserType}`)
    }

    if (role === 'HELPDESK' && !school) {
      // There is no provision for helpdesk users to log on as themselves
      throw new MtcSchoolMismatchError('No school found with the given DfE number')
    }

    if ((role === 'HELPDESK' || role === 'SERVICE-MANAGER') && school) {
      // The user is logging on as a school
      role = 'TEACHER'
    }

    return role
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
  },

  /**
   * Provides mapping of dfe sign-in roles to MTC roles.
   * @returns {string}
   */
  mapDfeRoleToMtcRole: (dfeRoleCode) => {
    const mapping = {
      mtc_service_manager: 'SERVICE-MANAGER',
      mtc_headteacher: 'HEADTEACHER',
      mtc_teacher: 'TEACHER',
      mtc_helpdesk: 'HELPDESK',
      mtc_test_developer: 'TEST-DEVELOPER'
    }

    let role = mapping[dfeRoleCode]

    if (!role) {
      throw new Error(`Unknown dfe role ${dfeRoleCode}`)
    }
    return role
  }
}

module.exports = service
