'use strict'

const roleDataService = require('./data-access/role.data.service')
const MtcHelpdeskImpersonationError = require('../models/errors/mtc-helpdesk-impersonation.error')
const mtcHelpdeskImpersonationErrorMessages = require('../lib/errors/mtc-helpdesk-impersonation')

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
      throw new MtcHelpdeskImpersonationError(mtcHelpdeskImpersonationErrorMessages.errorMessage, mtcHelpdeskImpersonationErrorMessages.userMessage)
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
  }
}

module.exports = service
