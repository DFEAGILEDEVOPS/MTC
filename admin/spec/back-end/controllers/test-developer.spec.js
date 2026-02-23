'use strict'

const httpMocks = require('node-mocks-http')

describe('test-developer controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = {
      EmailAddress: 'test-developer',
      UserName: 'test-developer',
      UserType: 'SchoolNom',
      role: 'TEST-DEVELOPER',
      logonAt: 1511374645103
    }
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  describe('Test developer routes', () => {
    let controller
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/test-developer/home'
    }

    beforeEach(() => {
      next = jest.fn()
    })

    describe('#getTestDeveloperHomePage - Happy path', () => {
      beforeEach(() => {
        controller = require('../../../controllers/test-developer').getTestDeveloperHomePage
      })

      test('should render the \'test-developer\'s the landing page', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        jest.spyOn(res, 'render').mockImplementation()
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('MTC for test development')
        expect(res.render).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
      })

      test('it calls next if there is an error thrown', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        jest.spyOn(res, 'render').mockImplementation(() => { throw new Error('mock rejection') })
        await controller(req, res, next)
        expect(next).toHaveBeenCalledTimes(1)
      })
    })
  })
})
