const httpMocks = require('node-mocks-http')
const middleware = require('../../../availability/middleware')
const config = require('../../../config')
const checkWindowPhaseConsts = require('../../../lib/consts/check-window-phase')
const roles = require('../../../lib/consts/roles')

describe('availablility/middleware', () => {
  let next
  let reqParams
  const res = httpMocks.createResponse()

  beforeEach(() => {
    next = jest.fn().mockImplementation()
    jest.spyOn(res, 'render').mockImplementation()
    config.OVERRIDE_AVAILABILITY_MIDDLEWARE = false
    reqParams = {
      method: 'GET',
      isAuthenticated: () => {},
      url: 'testUrl'
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('isPostLiveOrLaterCheckPhase', () => {
    test('it renders the section unavailable page for teachers when the checkWindow phase is closed', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.postCheckAdmin
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      await middleware.isPostLiveOrLaterCheckPhase(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    test('it renders the section unavailable page for teachers when the checkWindow phase is read only', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.readOnlyAdmin
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {
        // no-op
      }
      await middleware.isPostLiveOrLaterCheckPhase(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    test('it renders the section unavailable page for teachers when the checkWindow phase is unavailable', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.unavailable
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      await middleware.isPostLiveOrLaterCheckPhase(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })

    test('it allows teachers to pass through in the pre start phase', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.preStart
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      await middleware.isPostLiveOrLaterCheckPhase(req, res, next)
      expect(next).toHaveBeenCalledWith() // no args
      expect(res.render).not.toHaveBeenCalled()
    })

    test('it allows teachers to pass through in the try it out phase', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.tryItOut
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      await middleware.isPostLiveOrLaterCheckPhase(req, res, next)
      expect(next).toHaveBeenCalledWith() // no args
      expect(res.render).not.toHaveBeenCalled()
    })

    test('it allows teachers to pass through in the official check phase', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.officialCheck
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      await middleware.isPostLiveOrLaterCheckPhase(req, res, next)
      expect(next).toHaveBeenCalledWith() // no args
      expect(res.render).not.toHaveBeenCalled()
    })
  })

  describe('ifNotRole', () => {
    test('it calls the func param if the role is not the guard role', async () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.teacher
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      const thenFunc = jest.fn()
      const func = middleware.ifNotRole(roles.staAdmin, thenFunc)
      await func(req, res, next)
      expect(thenFunc).toHaveBeenCalled()
    })

    test('it does not call the func param if the role is the guard role', async () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.staAdmin
      }
      const req = httpMocks.createRequest(reqParams)
      req.breadcrumbs = () => {}
      const thenFunc = jest.fn()
      const func = middleware.ifNotRole(roles.staAdmin, thenFunc)
      await func(req, res, next)
      expect(thenFunc).not.toHaveBeenCalled()
    })
  })
})
