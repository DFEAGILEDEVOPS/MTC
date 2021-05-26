'use strict'

const roles = require('../lib/consts/roles.js')
const helpdeskService = {}

/**
 * Identify if role is helpdesk
 * @param {object} user
 * @returns {boolean}
 */
helpdeskService.isHelpdeskRole = (user) => {
  return user.role === roles.helpdesk
}

/**
 * Identify if role is staAdmin
 * @param {object} user
 * @returns {boolean}
 */
helpdeskService.isStaAdmin = (user) => {
  return user.role === roles.staAdmin
}

/**
 * Identify if current user has impersonation properties set
 * @param {object} user
 * @returns {boolean}
 */
helpdeskService.isImpersonating = (user) => {
  return typeof user.School === 'number' && typeof user.schoolId === 'number' && typeof user.timezone === 'string'
}

module.exports = helpdeskService
