'use strict'

const httpMocks = require('node-mocks-http')

describe('cookies page controller', () => {
  describe('Cookies MTC Form', () => {
    test('should render the initial cookies form page', async () => {
      const res = httpMocks.createResponse()
      res.locals = {}

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cookies'
      })
      req.breadcrumbs = jest.fn()
      const controller = require('../../../controllers/cookies')

      jest.spyOn(res, 'render').mockReturnValue(null)
      await controller.getCookiesForm(req, res)

      expect(res.locals.pageTitle).toBe('Cookies on MTC')
      expect(res.render).toHaveBeenCalled()
      expect(res.statusCode).toBe(200)
    })
  })
  describe('Cookies MTC', () => {
    test('should render the mtc cookies report page', async () => {
      const res = httpMocks.createResponse()
      res.locals = {}

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/cookies'
      })
      req.breadcrumbs = jest.fn()
      const controller = require('../../../controllers/cookies')

      jest.spyOn(res, 'render').mockReturnValue(null)
      await controller.getCookiesMtc(req, res)

      expect(res.locals.pageTitle).toBe('Cookies')
      expect(res.render).toHaveBeenCalled()
      expect(res.statusCode).toBe(200)
    })
  })
})
