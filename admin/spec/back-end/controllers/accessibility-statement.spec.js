'use strict'

/* global describe it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

describe('accessibility-statement page controller', () => {
  it('should render the initial accessibility-statement page', async () => {
    const res = httpMocks.createResponse()
    res.locals = {}

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/accessibility-statement'
    })
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    const controller = require('../../../controllers/accessibility-statement')

    spyOn(res, 'render').and.returnValue(null)
    await controller.getAccessibilityStatementPage(req, res)

    expect(res.locals.pageTitle).toBe('Accessibility statement')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
