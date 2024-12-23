'use strict'

const helpdeskService = require('../../../services/helpdesk.service')
const schoolHomePageService = require('../../../services/school-home-page/school-home-page.service')
const schoolController = require('../../../controllers/school')
const httpMocks = require('node-mocks-http')

// alias for the SUT
const sut = schoolController

function getRes () {
  const res = httpMocks.createResponse()
  res.locals = {}
  return res
}

function getReq (params) {
  const req = httpMocks.createRequest(params)
  req.user = { School: 9991001 }
  req.breadcrumbs = jest.fn()
  req.flash = jest.fn()
  return req
}

let next, res, req

const goodReqParams = {
  method: 'GET',
  url: '/school/school-home'
}

beforeEach(() => {
  res = getRes()
  req = getReq(goodReqParams)
  next = jest.fn()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('school controller', () => {
  test('it redirects to the helpdesk impersonation page if a helpdesk user has not set a school to impersonate', async () => {
    jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(true)
    jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
    jest.spyOn(res, 'redirect')
    await sut.getSchoolLandingPage(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/helpdesk/school-impersonation')
  })

  test('it makes a call to retrieve the content', async () => {
    jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(false)
    jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
    jest.spyOn(schoolHomePageService, 'getContent').mockResolvedValue({ mock: 'mock' })
    jest.spyOn(res, 'render')
    await sut.getSchoolLandingPage(req, res, next)
    expect(res.render).toHaveBeenCalled()
  })

  test('it calls next() if there an error is caught', async () => {
    jest.spyOn(helpdeskService, 'isHelpdeskRole').mockReturnValue(false)
    jest.spyOn(helpdeskService, 'isImpersonating').mockReturnValue(false)
    jest.spyOn(schoolHomePageService, 'getContent').mockRejectedValue(new Error('mock error'))
    await sut.getSchoolLandingPage(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('mock error'))
  })
})
