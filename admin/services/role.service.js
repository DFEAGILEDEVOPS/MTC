'use strict'

const service = {
  /**
   * Provides mapping of NCA Tools 'UserType' string to MTC role.
   * @returns {string} Defaults to teacher if not found
   */
  mapNcaRoleToMtcRole: (ncaUserType) => {
    const mapping = {
      SuperAdmin: 'SERVICE-MANAGER',
      SuperUser: 'HEADTEACHER',
      SchoolSup: 'TEACHER',
      SchoolNom: 'TEACHER',
      Admin: 'HELPDESK',
      DataAdmin: 'TEST-DEVELOPER'
    }

    if (mapping[ncaUserType]) {
      return mapping[ncaUserType]
    }

    return 'TEACHER'
  }
}

module.exports = service
