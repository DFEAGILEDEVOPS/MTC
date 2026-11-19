'use strict'

const getHomeRoute = require('../../../helpers/home-route')
const homeRoutes = require('../../../lib/consts/home-routes')
const roles = require('../../../lib/consts/roles')
const helpdeskService = require('../../../services/helpdesk.service')

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

  // roles.superUser and homeRoutes.superUserHomeRoute are defined on master, so skip until they are merged in
  const describeSuperUser = roles.superUser ? describe : describe.skip
  describeSuperUser('super user', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('returns the super user home route when not impersonating', () => {
      jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
      expect(getHomeRoute({ role: roles.superUser })).toBe(homeRoutes.superUserHomeRoute)
    })

    test('returns the school home route when impersonating a school', () => {
      jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(true)
      expect(getHomeRoute({ role: roles.superUser })).toBe(homeRoutes.schoolHomeRoute)
    })
  })

  test('returns undefined when there is no user', () => {
    expect(getHomeRoute(null)).toBeUndefined()
    expect(getHomeRoute(undefined)).toBeUndefined()
  })

  test('returns undefined for an unknown role', () => {
    expect(getHomeRoute({ role: 'UNKNOWN' })).toBeUndefined()
  })
})
