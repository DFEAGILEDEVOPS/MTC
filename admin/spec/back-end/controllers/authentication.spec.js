'use strict'

/* global describe it expect jest spyOn */

const httpMocks = require('node-mocks-http')
const sut = require('../../../controllers/authentication')
const homeRoutes = require('../../../lib/consts/home-routes')
const roles = require('../../../lib/consts/roles')

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
    it('should redirect to signin when not authenticated', () => {
      const res = createResponse()
      spyOn(res, 'redirect')
      sut.home(createRequest(false), res)
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should redirect to school homepage when teacher role is authenticated', () => {
      const res = createResponse()
      spyOn(res, 'redirect')
      sut.home(createRequest(true), res)
      expect(res.redirect).toHaveBeenCalledWith(homeRoutes.schoolHomeRoute)
    })

    it('should redirect to test dev homepage when test dev role is authenticated', () => {
      const res = createResponse()
      spyOn(res, 'redirect')
      sut.home(createRequest(true), res, getReqParams(), roles.testDeveloper)
      expect(res.redirect).toHaveBeenCalledWith(homeRoutes.testDeveloperHomeRoute)
    })
  })
})
