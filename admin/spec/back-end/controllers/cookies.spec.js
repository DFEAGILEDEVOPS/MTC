'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

describe('cookies page controller', () => {
  describe('Cookies MTC Form', () => {
    it('should render the initial cookies form page', async () => {
      const res = httpMocks.createResponse()
      res.locals = {}

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cookies'
      })
      req.breadcrumbs = jasmine.createSpy('breadcrumbs')
      const controller = require('../../../controllers/cookies')

      spyOn(res, 'render').and.returnValue(null)
      await controller.getCookiesForm(req, res)

      expect(res.locals.pageTitle).toBe('Cookies on MTC')
      expect(res.render).toHaveBeenCalled()
      expect(res.statusCode).toBe(200)
    })
  })
  describe('Cookies MTC', () => {
    it('should render the mtc cookies report page', async () => {
      const res = httpMocks.createResponse()
      res.locals = {}

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cookies'
      })
      req.breadcrumbs = jasmine.createSpy('breadcrumbs')
      const controller = require('../../../controllers/cookies')

      spyOn(res, 'render').and.returnValue(null)
      await controller.getCookiesMtc(req, res)

      expect(res.locals.pageTitle).toBe('Cookies')
      expect(res.render).toHaveBeenCalled()
      expect(res.statusCode).toBe(200)
    })
  })
})
