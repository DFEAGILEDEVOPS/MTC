'use strict'

const httpMocks = require('node-mocks-http')

describe('privacy page controller', () => {
  test('should render the initial groups page', async () => {
    const res = httpMocks.createResponse()
    res.locals = {}

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/privacy'
    })
    req.breadcrumbs = jest.fn()
    const controller = require('../../../controllers/privacy')

    jest.spyOn(res, 'render').mockImplementation()
    await controller.getPrivacyPage(req, res)

    expect(res.locals.pageTitle).toBe('Privacy notice')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
