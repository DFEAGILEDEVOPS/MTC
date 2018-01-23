'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
require('sinon-mongoose')

describe('contact page simple controller', () => {
  it('should render the initial groups page', async (done) => {
    let res
    let req
    let controller

    res = httpMocks.createResponse()
    res.locals = {}

    req = httpMocks.createRequest({
      method: 'GET',
      url: '/contact'
    })
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    controller = require('../../controllers/contact')

    spyOn(res, 'render').and.returnValue(null)
    await controller(req, res)

    expect(res.locals.pageTitle).toBe('Contact')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    done()
  })
})
