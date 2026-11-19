'use strict'

const homeRoutes = require('../lib/consts/home-routes')
const roles = require('../lib/consts/roles')
const helpdeskService = require('../services/helpdesk.service')

/**
 * Get the home page route for a signed in user, based on their role.
 * Routes are relative so they stay on the environment the user is already on.
 * @param {{ role?: string } | null | undefined} user
 * @returns {string | undefined} the home route, or undefined when there is no user or the role is unknown
 */
const getHomeRoute = (user) => {
  if (!user) return undefined
  switch (user.role) {
    case roles.teacher:
    case roles.helpdesk:
    case roles.staAdmin:
      return homeRoutes.schoolHomeRoute
    case roles.superUser:
      return helpdeskService.isImpersonating(user) ?
        homeRoutes.schoolHomeRoute :
        homeRoutes.superUserHomeRoute
    case roles.testDeveloper:
      return homeRoutes.testDeveloperHomeRoute
    case roles.serviceManager:
      return homeRoutes.serviceManagerHomeRoute
    case roles.techSupport:
      return homeRoutes.techSupportHomeRoute
    default:
      return undefined
  }
}

module.exports = getHomeRoute
