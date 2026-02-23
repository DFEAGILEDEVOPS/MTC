'use strict'

const httpMocks = require('node-mocks-http')

describe('accessibility-statement page controller', () => {
  test('should render the initial accessibility-statement page', async () => {
    const res = httpMocks.createResponse()
    res.locals = {}

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/accessibility-statement'
    })
    req.breadcrumbs = jest.fn()
    const controller = require('../../../controllers/accessibility-statement')

    jest.spyOn(res, 'render').mockImplementation()
    await controller.getAccessibilityStatementPage(req, res)

    expect(res.locals.pageTitle).toBe('Accessibility statement')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
