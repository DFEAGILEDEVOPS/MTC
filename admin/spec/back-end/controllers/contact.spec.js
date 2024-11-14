'use strict'


const httpMocks = require('node-mocks-http')

describe('contact page simple controller', () => {
  test('should render the initial groups page', async () => {
    const res = httpMocks.createResponse()
    res.locals = {}

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/contact'
    })
    req.breadcrumbs = jest.fn()
    const controller = require('../../../controllers/contact')

    jest.spyOn(res, 'render').mockReturnValue(null)
    await controller.getContactPage(req, res)

    expect(res.locals.pageTitle).toBe('Contact')
    expect(res.render).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
