'use strict'

const httpMocks = require('node-mocks-http')
const sut = require('../../../controllers/authentication')
const homeRoutes = require('../../../lib/consts/home-routes')
const roles = require('../../../lib/consts/roles')
const config = require('../../../config')
const authModes = require('../../../lib/consts/auth-modes')

const getReqParams = (url = '/', method = 'GET') => {
  return {
    method,
    url
  }
}

const createRequest = (isAuthenticated, params = getReqParams, role = 'TEACHER') => {
  const req = httpMocks.createRequest(params)
  req.user = {
    role
  }
  req.isAuthenticated = () => isAuthenticated
  req.breadcrumbs = jest.fn().mockReturnValue('breadcrumbs')
  if (isAuthenticated) {
    req.session = {
      regenerate: () => {
      }
    }
    req.logout = () => {
    }
  }
  return req
}

const createResponse = () => {
  const res = httpMocks.createResponse()
  res.locals = {}
  return res
}

describe('authentication controller', () => {
  beforeEach(() => {
    config.Auth.Mode = authModes.local
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('home', () => {
    describe('unauthenticated requests', () => {
      const unauthenticated = false
      test('should redirect to signin when requested url is not /sign-in', () => {
        const res = createResponse()
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(createRequest(unauthenticated), res)
        expect(res.redirect).toHaveBeenCalledWith('/sign-in')
        expect(res.statusCode).toBe(200)
      })

      test('renders view if /sign-in is requested', () => {
        const res = createResponse()
        jest.spyOn(res, 'render').mockImplementation()
        const params = getReqParams('/sign-in')
        sut.home(createRequest(unauthenticated, params), res)
        expect(res.render).toHaveBeenCalledWith('sign-in')
        expect(res.statusCode).toBe(200)
      })

      test('redirect to /oidc-sign-in if in dsi auth mode', () => {
        config.Auth.mode = authModes.dfeSignIn
        const res = createResponse()
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(createRequest(unauthenticated), res)
        expect(res.redirect).toHaveBeenCalledWith('/oidc-sign-in')
        expect(res.statusCode).toBe(200)

        // needed as fails other tests when not switched back
        config.Auth.mode = authModes.local
      })
    })

    describe('authenticated requests', () => {
      const authenticated = true
      test('should redirect to correct home when teacher role is authenticated', () => {
        const res = createResponse()
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(createRequest(authenticated), res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
        expect(res.statusCode).toBe(200)
      })

      test('should redirect to correct home when helpdesk role is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.helpdesk)
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
        expect(res.statusCode).toBe(200)
      })

      test('should redirect to correct home when test dev role is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.testDeveloper)
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.testDeveloperHomeRoute)
        expect(res.statusCode).toBe(200)
      })

      test('should redirect to correct home when service manager is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.serviceManager)
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.serviceManagerHomeRoute)
        expect(res.statusCode).toBe(200)
      })

      test('should redirect to correct home when techsupport role is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.techSupport)
        jest.spyOn(res, 'redirect').mockImplementation()
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.techSupportHomeRoute)
        expect(res.statusCode).toBe(200)
      })
    })
  })

  describe('getSignIn', () => {
    test('redirects to /sign-in if unauthenticated', () => {
      const unauthenticated = false
      const req = createRequest(unauthenticated)
      const res = createResponse()
      jest.spyOn(res, 'redirect').mockImplementation()
      sut.getSignIn(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
      expect(res.statusCode).toBe(200)
    })

    test('redirects to home if authenticated', () => {
      const unauthenticated = true
      const req = createRequest(unauthenticated)
      const res = createResponse()
      jest.spyOn(res, 'redirect').mockImplementation()
      sut.getSignIn(req, res)
      expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
      expect(res.statusCode).toBe(200)
    })
  })

  describe('postSignIn', () => {
    test('redirects to home', () => {
      const authenticated = true
      const req = createRequest(authenticated)
      const res = createResponse()
      jest.spyOn(res, 'redirect').mockImplementation()
      sut.postSignIn(req, res)
      expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
      expect(res.statusCode).toBe(200)
    })
  })

  describe('getSignInFailure', () => {
    test('should render failure view', () => {
      const req = createRequest()
      const res = createResponse()
      jest.spyOn(res, 'render').mockImplementation()
      sut.getSignInFailure(req, res)
      expect(res.render).toHaveBeenCalledWith('sign-in-failure')
      expect(res.statusCode).toBe(200)
    })
  })

  describe('getUnauthorised', () => {
    test('should render failure view', () => {
      const req = createRequest()
      const res = createResponse()
      jest.spyOn(res, 'render').mockImplementation()
      sut.getUnauthorised(req, res)
      expect(res.render).toHaveBeenCalledWith('unauthorised')
      expect(res.statusCode).toBe(401)
      expect(res.locals.pageTitle).toBe('Access Unauthorised')
    })
  })

  describe('getSignedOut', () => {
    test('should render signedout view', () => {
      const req = createRequest()
      const res = createResponse()
      jest.spyOn(res, 'render').mockImplementation()
      sut.getSignedOut(req, res)
      expect(res.render).toHaveBeenCalledWith('dsi-signedout')
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('Signed Out')
    })
  })
})
