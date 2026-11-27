const httpMocks = require('node-mocks-http')
const roles = require('../../../lib/consts/roles')
const emergencyOffSwitchService = require('../../../services/emergency-off-switch.service')
const emergencyOffSwitchMiddleware = require('../../../availability/emergency-off-switch.middleware')

describe('emergencyOffSwitchMiddleware', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = httpMocks.createRequest({
      path: '/school/school-home',
      isAuthenticated: () => true,
      user: { role: roles.teacher }
    })
    res = httpMocks.createResponse()
    res.locals = {}
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders the emergency holding page for teachers when the switch is enabled', async () => {
    jest.spyOn(emergencyOffSwitchService, 'get').mockResolvedValue({ isEnabled: true })
    jest.spyOn(res, 'render')

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(res.locals.pageTitle).toBe('The service is temporarily unavailable')
    expect(res.render).toHaveBeenCalledWith('availability/emergency-off-switch-service-unavailable', { isPupil: false })
    expect(next).not.toHaveBeenCalled()
  })

  test('renders the holding page for teacher form submissions when enabled', async () => {
    req.method = 'POST'
    req.path = '/group/create'
    jest.spyOn(emergencyOffSwitchService, 'get').mockResolvedValue({ isEnabled: true })
    jest.spyOn(res, 'render')

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(res.render).toHaveBeenCalledWith('availability/emergency-off-switch-service-unavailable', { isPupil: false })
    expect(next).not.toHaveBeenCalled()
  })

  test('preserves the pupil view when a teacher session visits the pupil holding page', async () => {
    req.path = '/emergency-off-switch-service-unavailable'
    req.query = { source: 'pupil' }
    jest.spyOn(emergencyOffSwitchService, 'get').mockResolvedValue({ isEnabled: true })
    jest.spyOn(res, 'render')

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(res.render).toHaveBeenCalledWith('availability/emergency-off-switch-service-unavailable', { isPupil: true })
    expect(next).not.toHaveBeenCalled()
  })

  test('allows teachers through when the switch is disabled', async () => {
    jest.spyOn(emergencyOffSwitchService, 'get').mockResolvedValue({ isEnabled: false })

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  test.each([roles.serviceManager, roles.superUser])('does not gate the %s role', async (role) => {
    req.user.role = role
    const getState = jest.spyOn(emergencyOffSwitchService, 'get')

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(getState).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('does not gate unauthenticated requests', async () => {
    req.isAuthenticated = () => false
    const getState = jest.spyOn(emergencyOffSwitchService, 'get')

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(getState).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  test.each(['/sign-out', '/sign-out/', '/sign-out-dso'])('keeps %s available when enabled', async (path) => {
    req.path = path
    const getState = jest.spyOn(emergencyOffSwitchService, 'get')

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(getState).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('passes state lookup errors to the error handler', async () => {
    const error = new Error('Database unavailable')
    jest.spyOn(emergencyOffSwitchService, 'get').mockRejectedValue(error)

    await emergencyOffSwitchMiddleware(req, res, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
