'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

describe('cookies page controller', () => {
  it('should render the initial cookies page', async (done) => {
    let res
    let req
    let controller

    res = httpMocks.createResponse()
    res.locals = {}

    req = httpMocks.createRequest({
      method: 'GET',
      url: '/cookies'
    })
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    controller = require('../../controllers/cookies')

    spyOn(res, 'render').and.returnValue(null)
    await controller(req, res)

    expect(res.locals.pageTitle).toBe('Cookies')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    done()
  })
})
