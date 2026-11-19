'use strict'

const getHomeRoute = require('../../../helpers/home-route')
const homeRoutes = require('../../../lib/consts/home-routes')
const roles = require('../../../lib/consts/roles')

describe('getHomeRoute', () => {
  test.each([
    [roles.teacher, homeRoutes.schoolHomeRoute],
    [roles.helpdesk, homeRoutes.schoolHomeRoute],
    [roles.staAdmin, homeRoutes.schoolHomeRoute],
    [roles.testDeveloper, homeRoutes.testDeveloperHomeRoute],
    [roles.serviceManager, homeRoutes.serviceManagerHomeRoute],
    [roles.techSupport, homeRoutes.techSupportHomeRoute]
  ])('returns the home route for the %s role', (role, expected) => {
    expect(getHomeRoute({ role })).toBe(expected)
  })

  test('returns undefined when there is no user', () => {
    expect(getHomeRoute(null)).toBeUndefined()
    expect(getHomeRoute(undefined)).toBeUndefined()
  })

  test('returns undefined for an unknown role', () => {
    expect(getHomeRoute({ role: 'UNKNOWN' })).toBeUndefined()
  })
})
