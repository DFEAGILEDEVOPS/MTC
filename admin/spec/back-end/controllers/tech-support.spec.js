'use strict'
/* global describe beforeEach it expect jasmine spyOn xit */

const httpMocks = require('node-mocks-http')
const checkDiagnosticService = require('../../../services/check-diagnostic.service')

let sut
let next
const checkCode = 'dd3ed042-648f-49bd-a559-45127596716d'

const getReqParams = (url = '/tech-support/home', method = 'GET') => {
  return {
    method: method,
    url: url
  }
}

const getRequest = (params = getReqParams) => {
  const req = httpMocks.createRequest(params)
  req.user = {
    role: 'TECH-SUPPORT'
  }
  req.breadcrumbs = jasmine.createSpy('breadcrumbs')
  return req
}

const getResponse = () => {
  const res = httpMocks.createResponse()
  res.locals = {}
  return res
}

describe('tech-support controller', () => {
  beforeEach(() => {
    sut = require('../../../controllers/tech-support')
    next = jasmine.createSpy('next')
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('/home', () => {
    it('GET: should render the home page', async () => {
      const req = getRequest(getReqParams)
      const res = getResponse()
      spyOn(res, 'render').and.returnValue(null)
      await sut.getHomePage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('Tech Support Homepage')
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('/checkview', () => {
    it('GET: should render the checkcode input box', async () => {
      const req = getRequest(getReqParams)
      const res = getResponse()
      spyOn(res, 'render').and.returnValue(null)
      await sut.getCheckViewPage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('Tech Support Check View')
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('POST: should render the check summary', async () => {
      const req = getRequest(getReqParams)
      req.body = {
        checkCode: checkCode
      }
      const res = getResponse()
      spyOn(res, 'render').and.returnValue(null)
      spyOn(checkDiagnosticService, 'getByCheckCode').and.returnValue({})
      await sut.postCheckViewPage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(checkDiagnosticService.getByCheckCode).toHaveBeenCalledWith(checkCode)
    })

    xit('POST: should redirect back to GET when validation fails', async () => {
      const req = getRequest(getReqParams)
      const res = getResponse()
      spyOn(res, 'render')
      await sut.postCheckViewPage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
