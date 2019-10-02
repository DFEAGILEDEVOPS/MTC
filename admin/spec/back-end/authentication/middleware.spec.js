'use strict'

/* global describe it beforeEach expect spyOn jasmine */

const httpMocks = require('node-mocks-http')
const isAuthenticated = require('../../../authentication/middleware')

describe('isAuthenticated', () => {
  let next
  beforeEach(() => {
    next = jasmine.createSpy('next')
  })
  const reqParams = {
    method: 'GET',
    isAuthenticated: () => {},
    url: 'testUrl'
  }
  const res = httpMocks.createResponse()
  describe(' if the request is authenticated', () => {
    it('authenticates a user against an allowed role of a string type', async () => {
      let reqParams = {
        method: 'GET',
        isAuthenticated: () => {},
        user: {
          id: 1,
          UserName: 'UserName',
          role: 'SERVICE-MANAGER'
        }
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      const func = isAuthenticated('SERVICE-MANAGER')
      func(req, res, next)
      expect(next).toHaveBeenCalled()
    })
    it('authenticates a user against an allowed list of roles', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'SERVICE-MANAGER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      const allowedRoles = ['SERVICE-MANAGER', 'TEACHER']
      const func = isAuthenticated(allowedRoles)
      func(req, res, next)
      expect(next).toHaveBeenCalled()
    })
    it('does not authenticate a user that is not matching a role of a string type', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const allowedRole = 'TEACHER'
      const func = isAuthenticated(allowedRole)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('does not authenticate a user that is not included in the list of allowed roles', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const allowedRoles = ['SERVICE-MANAGER', 'TEACHER']
      const func = isAuthenticated(allowedRoles)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('calls redirect if the role passed is undefined while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const func = isAuthenticated(undefined)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('calls redirect if the role passed is an empty string while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const func = isAuthenticated('')
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('calls redirect if the role passed is an object while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const func = isAuthenticated({})
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('calls redirect if the role passed is an object while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const funcArg = function () {}
      const func = isAuthenticated(funcArg)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('calls redirect if the request user object does not have a role defined ', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: undefined
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const func = isAuthenticated('TEST-DEVELOPER')
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('prevents the programmer mis-use', () => {
      reqParams.user = {}
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const func = isAuthenticated()
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
    it('redirects to unauthorised route if the user role is undefined and the allowed role is undefined', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: undefined
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(true)
      spyOn(res, 'redirect')
      const func = isAuthenticated()
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
  })
  describe(' if the request is not authenticated', () => {
    it('redirects to sign in route', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: 'TEST-DEVELOPER'
      }
      const req = httpMocks.createRequest(reqParams)
      spyOn(req, 'isAuthenticated').and.returnValue(false)
      spyOn(res, 'redirect')
      const func = isAuthenticated(undefined)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
    })
  })
})
