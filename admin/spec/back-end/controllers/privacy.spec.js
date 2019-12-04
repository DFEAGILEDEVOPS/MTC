'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

describe('privacy page controller', () => {
  it('should render the initial groups page', async () => {
    const res = httpMocks.createResponse()
    res.locals = {}

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/privacy'
    })
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    const controller = require('../../../controllers/privacy')

    spyOn(res, 'render').and.returnValue(null)
    await controller.getPrivacyPage(req, res)

    expect(res.locals.pageTitle).toBe('Privacy notice')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
