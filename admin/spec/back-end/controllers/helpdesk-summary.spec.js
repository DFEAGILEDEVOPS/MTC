'use strict'

const controller = require('../../../controllers/helpdesk-summary')
const schoolSummaryService = require('../../../services/school-summary.service')

const httpMocks = require('node-mocks-http')

describe('helpdesk summary controller', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = params.user || { School: 9991001, schoolId: 123 }
    req.session = params.session || {}
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const reqParams = {
    method: 'GET',
    url: '/school-summary'
  }
  test('should render the school summary', async () => {
    const req = getReq(reqParams)
    const res = getRes()
    jest.spyOn(res, 'render').mockImplementation()
    jest.spyOn(schoolSummaryService, 'getSummary').mockImplementation()
    await controller.getSummary(req, res, next)
    expect(res.render).toHaveBeenCalled()
    expect(schoolSummaryService.getSummary).toHaveBeenCalled()
  })
})
