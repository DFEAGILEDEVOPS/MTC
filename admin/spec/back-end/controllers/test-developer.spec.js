'use strict'
/* global describe beforeEach it expect jasmine spyOn */

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
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('Test develope routes', () => {
    let controller
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/test-developer/home'
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('#getTestDeveloperHomePage - Happy path', () => {
      beforeEach(() => {
        controller = require('../../../controllers/test-developer').getTestDeveloperHomePage
      })

      it('should render the \'test-developer\'s the landing page', async () => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('MTC for test development')
        expect(res.render).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
