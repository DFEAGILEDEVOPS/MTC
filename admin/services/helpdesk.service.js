'use strict'

const roles = require('../lib/consts/service-roles.js')
const helpdeskService = {}

/**
 * Identify if helpdesk user has not received impersonation
 * @param {object} user
 * @returns {boolean}
 */
helpdeskService.hasHelpdeskNotReceivedImpersonation = (user) => {
  if (user.role !== roles.helpdesk) {
    return false
  }
  if (!user.School || !user.schoolId || typeof user.timezone !== 'string') {
    return true
  }
}

module.exports = helpdeskService
