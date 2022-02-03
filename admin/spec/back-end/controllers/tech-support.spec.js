'use strict'
/* global describe beforeEach test expect jest */

const httpMocks = require('node-mocks-http')
const checkDiagnosticService = require('../../../services/check-diagnostic.service')
const payloadService = require('../../../services/payload.service')
const administrationMessageService = require('../../../services/administration-message.service')
const queueMgmtService = require('../../../services/tech-support-queue-management.service')
const resultsResyncService = require('../../../services/tech-support/sync-results-resync.service')

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
  req.breadcrumbs = jest.fn()
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
    next = jest.fn()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('/home', () => {
    test('GET: should render the home page', async () => {
      const req = getRequest(getReqParams)
      const res = getResponse()
      jest.spyOn(administrationMessageService, 'getMessage').mockResolvedValue(Promise.resolve(''))
      jest.spyOn(res, 'render').mockResolvedValue(null)
      await sut.getHomePage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('Tech Support Homepage')
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('/checkview', () => {
    test('GET: should render the checkcode input box', async () => {
      const req = getRequest(getReqParams)
      const res = getResponse()
      jest.spyOn(res, 'render').mockResolvedValue(null)
      await sut.getCheckViewPage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('Tech Support Check View')
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('POST: should render the check summary', async () => {
      const req = getRequest(getReqParams('/tech-support/checkview', 'POST'))
      req.body = {
        checkCode: checkCode
      }
      const res = getResponse()
      jest.spyOn(res, 'render').mockResolvedValue(null)
      jest.spyOn(checkDiagnosticService, 'getByCheckCode').mockResolvedValue({})
      await sut.postCheckViewPage(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(checkDiagnosticService.getByCheckCode).toHaveBeenCalledWith(checkCode)
    })

    test('POST: should call getCheckViewPage when validation fails', async () => {
      const req = getRequest(getReqParams('/tech-support/checkview', 'POST'))
      const res = getResponse()
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(sut, 'getCheckViewPage').mockImplementation()
      await sut.postCheckViewPage(req, res, next)
      expect(next).not.toHaveBeenCalled()
      expect(res.statusCode).toBe(200)
      expect(sut.getCheckViewPage).toHaveBeenCalled()
    })
  })

  describe('/received-check-payload', () => {
    test('GET: should send payload as JSON response', async () => {
      const req = getRequest(getReqParams('/tech-support/received-check-payload', 'GET'))
      const res = getResponse()
      req.query.checkCode = checkCode
      jest.spyOn(payloadService, 'getPayload').mockImplementation()
      jest.spyOn(res, 'send').mockImplementation()
      jest.spyOn(res, 'type').mockImplementation()
      await sut.getReceivedCheckPayload(req, res, next)
      expect(res.send).toHaveBeenCalled()
      expect(res.type).toHaveBeenCalledWith('json')
      expect(next).not.toHaveBeenCalled()
      expect(payloadService.getPayload).toHaveBeenCalledWith(checkCode)
    })
  })

  describe('/queue-overview', () => {
    test('GET: should request storage account and service bus queue summaries', async () => {
      const req = getRequest(getReqParams('/tech-support/queue-overview', 'GET'))
      const res = getResponse()
      jest.spyOn(queueMgmtService, 'getServiceBusQueueSummary').mockImplementation()
      jest.spyOn(queueMgmtService, 'getStorageAccountQueueSummary').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.showQueueOverview(req, res, next)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(queueMgmtService.getServiceBusQueueSummary).toHaveBeenCalledTimes(1)
      expect(queueMgmtService.getStorageAccountQueueSummary).toHaveBeenCalledTimes(1)
    })
  })

  describe('/results-resync-check', () => {
    test('GET: should render the page', async () => {
      const req = getRequest(getReqParams('/tech-support/results-resync-check', 'GET'))
      const res = getResponse()
      jest.spyOn(res, 'render').mockResolvedValue(null)
      await sut.getCheckResultsResyncCheck(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe('Check Results - Resync Check')
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('POST: should call the service', async () => {
      const req = getRequest(getReqParams('/tech-support/results-resync-check', 'POST'))
      req.body = {
        checkCode: checkCode
      }
      const res = getResponse()
      jest.spyOn(res, 'render').mockResolvedValue(null)
      jest.spyOn(resultsResyncService, 'resyncSingleCheck').mockResolvedValue(Promise.resolve())
      await sut.postCheckResultsResyncCheck(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(resultsResyncService.resyncSingleCheck).toHaveBeenCalledWith(checkCode)
    })
  })
})
