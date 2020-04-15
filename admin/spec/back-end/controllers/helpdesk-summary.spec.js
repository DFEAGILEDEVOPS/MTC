'use strict'

/* global describe it expect jasmine beforeEach spyOn */

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
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  beforeEach(() => {
    next = jasmine.createSpy('next')
  })

  const reqParams = {
    method: 'GET',
    url: '/school-summary'
  }
  it('should render the school summary', async () => {
    const req = getReq(reqParams)
    const res = getRes()
    spyOn(res, 'render')
    spyOn(schoolSummaryService, 'getSummary')
    await controller.getSummary(req, res, next)
    expect(res.render).toHaveBeenCalled()
    expect(schoolSummaryService.getSummary).toHaveBeenCalled()
  })
})
