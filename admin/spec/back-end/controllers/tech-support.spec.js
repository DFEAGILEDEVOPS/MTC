'use strict'
/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

let sut
let next

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
      const res = getResponse()
      spyOn(res, 'render').and.returnValue(null)
      await sut.postCheckViewPage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(res.summaryData).toBeDefined()
      // expect(next).not.toHaveBeenCalled()
    })
  })
})
