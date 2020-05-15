'use strict'

/* global describe it expect jest spyOn */

const httpMocks = require('node-mocks-http')
const sut = require('../../../controllers/authentication')
const homeRoutes = require('../../../lib/consts/home-routes')
const roles = require('../../../lib/consts/roles')
const config = require('../../../config')
const authModes = require('../../../lib/consts/auth-modes')

const getReqParams = (url = '/', method = 'GET') => {
  return {
    method: method,
    url: url
  }
}

const createRequest = (isAuthenticated, params = getReqParams, role = 'TEACHER') => {
  const req = httpMocks.createRequest(params)
  req.user = {
    role: role
  }
  req.isAuthenticated = () => isAuthenticated
  req.breadcrumbs = jest.fn().mockReturnValue('breadcrumbs')
  return req
}

const createResponse = () => {
  const res = httpMocks.createResponse()
  res.locals = {}
  return res
}

describe('authentication controller', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('home', () => {
    describe('unauthenticated requests', () => {
      const unauthenticated = false
      it('should redirect to signin when requested url is not /sign-in', () => {
        const res = createResponse()
        spyOn(res, 'redirect')
        sut.home(createRequest(unauthenticated), res)
        expect(res.redirect).toHaveBeenCalledWith('/sign-in')
      })

      it('renders view if /sign-in is requested', () => {
        const res = createResponse()
        spyOn(res, 'render')
        const params = getReqParams('/sign-in')
        sut.home(createRequest(unauthenticated, params), res)
        expect(res.render).toHaveBeenCalledWith('sign-in')
      })

      it('redirect to /oidc-sign-in if in dsi auth mode', () => {
        config.Auth.mode = authModes.dfeSignIn
        const res = createResponse()
        spyOn(res, 'redirect')
        sut.home(createRequest(unauthenticated), res)
        expect(res.redirect).toHaveBeenCalledWith('/oidc-sign-in')
      })
    })

    describe('authenticated requests', () => {
      const authenticated = true
      it('should redirect to correct home when teacher role is authenticated', () => {
        const res = createResponse()
        spyOn(res, 'redirect')
        sut.home(createRequest(authenticated), res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
      })

      it('should redirect to correct home when helpdesk role is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.helpdesk)
        spyOn(res, 'redirect')
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
      })

      it('should redirect to correct home when test dev role is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.testDeveloper)
        spyOn(res, 'redirect')
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.testDeveloperHomeRoute)
      })

      it('should redirect to correct home when service manager is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.serviceManager)
        spyOn(res, 'redirect')
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.serviceManagerHomeRoute)
      })

      it('should redirect to correct home when techsupport role is authenticated', () => {
        const res = createResponse()
        const req = createRequest(authenticated, getReqParams(), roles.techSupport)
        spyOn(res, 'redirect')
        sut.home(req, res)
        expect(res.redirect).toHaveBeenCalledWith(homeRoutes.techSupportHomeRoute)
      })
    })
  })

  describe('getSignIn', () => {
    it('redirects to /sign-in if unauthenticated', () => {
      
    })
  })
})
