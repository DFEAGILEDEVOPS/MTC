'use strict'

const httpMocks = require('node-mocks-http')
const isAuthenticated = require('../../../authentication/middleware')
const roles = require('../../../lib/consts/roles')

describe('isAuthenticated', () => {
  let next

  beforeEach(() => {
    next = jest.fn()
  })

  const reqParams = {
    method: 'GET',
    isAuthenticated: () => {},
    url: 'testUrl'
  }
  const res = httpMocks.createResponse()

  describe(' if the request is authenticated', () => {
    test('authenticates a user against an allowed role of a string type', async () => {
      const reqParams = {
        method: 'GET',
        isAuthenticated: () => {},
        user: {
          id: 1,
          UserName: 'UserName',
          role: roles.serviceManager
        }
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      const func = isAuthenticated(roles.serviceManager)
      func(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    test('authenticates a user against an allowed list of roles', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.serviceManager
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      const allowedRoles = [roles.serviceManager, roles.teacher]
      const func = isAuthenticated(allowedRoles)
      func(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    test('does not authenticate a user that is not matching a role of a string type', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const allowedRole = roles.teacher
      const func = isAuthenticated(allowedRole)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('does not authenticate a user that is not included in the list of allowed roles', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const allowedRoles = [roles.serviceManager, roles.teacher]
      const func = isAuthenticated(allowedRoles)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('calls redirect if the role passed is undefined while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated(undefined)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('calls redirect if the role passed is an empty string while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated('')
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('calls redirect if the role passed is an object while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated({})
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('calls redirect if the role passed is an object while the request is authenticated', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const funcArg = function () {}
      const func = isAuthenticated(funcArg)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('calls redirect if the request user object does not have a role defined ', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: undefined
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated(roles.testDeveloper)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('prevents the programmer mis-use', () => {
      reqParams.user = {}
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated()
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('redirects to unauthorised route if the user role is undefined and the allowed role is undefined', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: undefined
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated()
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })

    test('redirects to unauthorised route if the user role is undefined and the allowed role is an array with a value' +
      ' of undefined', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: undefined
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated([undefined])
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/unauthorised')
    })
  })

  describe(' if the request is not authenticated', () => {
    test('redirects to sign in route', () => {
      reqParams.user = {
        id: 1,
        UserName: 'UserName',
        role: roles.testDeveloper
      }
      const req = httpMocks.createRequest(reqParams)
      jest.spyOn(req, 'isAuthenticated').mockReturnValue(false)
      jest.spyOn(res, 'redirect').mockImplementation()
      const func = isAuthenticated(undefined)
      func(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/sign-in')
    })
  })
})
