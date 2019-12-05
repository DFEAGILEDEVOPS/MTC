'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

describe('contact page simple controller', () => {
  it('should render the initial groups page', async () => {
    const res = httpMocks.createResponse()
    res.locals = {}

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/contact'
    })
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    const controller = require('../../../controllers/contact')

    spyOn(res, 'render').and.returnValue(null)
    await controller.getContactPage(req, res)

    expect(res.locals.pageTitle).toBe('Contact')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
