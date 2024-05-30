'use strict'
/* global describe beforeEach test expect jest */

const httpMocks = require('node-mocks-http')
const checkDiagnosticService = require('../../../services/check-diagnostic.service')
const payloadService = require('../../../services/payload.service')
const queueMgmtService = require('../../../services/tech-support-queue-management.service')
const resultsResyncService = require('../../../services/tech-support/sync-results-resync.service')
const { PsReportExecService } = require('../../../services/tech-support/ps-report-exec/ps-report-exec.service')
const { CheckSubmitService } = require('../../../services/tech-support/check-submit/check-submit.service')

let sut
let next
const checkCode = 'dd3ed042-648f-49bd-a559-45127596716d'

const getReqParams = (url = '/tech-support/home', method = 'GET') => {
  return {
    method,
    url
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
        checkCode
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

  describe('/clear-service-bus-queue', () => {
    test('GET: should render the page', async () => {
      const reqParams = getReqParams('/tech-support/clear-service-bus-queue', 'GET')
      const req = getRequest(reqParams)
      const queueName = 'test-queue'
      req.params.queueName = queueName
      const res = getResponse()
      jest.spyOn(res, 'render').mockResolvedValue(null)
      await sut.getClearServiceBusQueue(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.locals.pageTitle).toBe(`Clear Service Bus Queue: ${queueName}`)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
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
        checkCode
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

  describe('/getJsonMarkedCheck', () => {
    test('it sends back an error if the checkcode is missing', async () => {
      const req = getRequest(getReqParams('/tech-support/marked-check-json', 'GET'))
      const res = getResponse()
      req.params = { checkCode: undefined }
      await sut.getJsonMarkedCheck(req, res, next)
      expect(res.statusCode).toBe(400)
      const data = res._getJSONData()
      expect(data.error).toBe('Missing checkCode')
    })

    test('it sends back an error if the checkCode is not a valid UUID', async () => {
      const req = getRequest(getReqParams('/tech-support/marked-check-json', 'GET'))
      const res = getResponse()
      req.params = { checkCode: 'invalidUUID' }
      await sut.getJsonMarkedCheck(req, res, next)
      expect(res.statusCode).toBe(400)
      const data = res._getJSONData()
      expect(data.error).toBe('checkCode is not a valid UUID')
    })

    test('it calls the service to get the data to send back', async () => {
      const req = getRequest(getReqParams('/tech-support/marked-check-json', 'GET'))
      const res = getResponse()
      jest.spyOn(checkDiagnosticService, 'getMarkedCheckEntityByCheckCode').mockResolvedValue({ some: 'data' })
      req.params = { checkCode: 'a41d8cb3-aba9-4960-b806-6daf7df19555' }
      await sut.getJsonMarkedCheck(req, res, next)
      expect(res.statusCode).toBe(200)
      const data = res._getJSONData()
      expect(data.some).toBe('data')
    })

    test('it sends a server error with technical message', async () => {
      const req = getRequest(getReqParams('/tech-support/marked-check-json', 'GET'))
      const res = getResponse()
      jest.spyOn(checkDiagnosticService, 'getMarkedCheckEntityByCheckCode').mockRejectedValue(new Error('mock error'))
      req.params = { checkCode: 'a41d8cb3-aba9-4960-b806-6daf7df19555' }
      await sut.getJsonMarkedCheck(req, res, next)
      expect(res.statusCode).toBe(500)
      const data = res._getJSONData()
      expect(data.error).toBe('Server error: mock error')
    })
  })

  describe('/getJsonReceivedCheck', () => {
    test('it sends back an error if the checkcode is missing', async () => {
      const req = getRequest(getReqParams('/tech-support/received-check-json', 'GET'))
      const res = getResponse()
      req.params = { checkCode: undefined }
      await sut.getJsonReceivedCheck(req, res, next)
      expect(res.statusCode).toBe(400)
      const data = res._getJSONData()
      expect(data.error).toBe('Missing checkCode')
    })

    test('it sends back an error if the checkCode is not a valid UUID', async () => {
      const req = getRequest(getReqParams('/tech-support/received-check-json', 'GET'))
      const res = getResponse()
      req.params = { checkCode: 'invalidUUID' }
      await sut.getJsonReceivedCheck(req, res, next)
      expect(res.statusCode).toBe(400)
      const data = res._getJSONData()
      expect(data.error).toBe('checkCode is not a valid UUID')
    })

    test('it calls the service to get the data to send back', async () => {
      const req = getRequest(getReqParams('/tech-support/received-check-json', 'GET'))
      const res = getResponse()
      jest.spyOn(checkDiagnosticService, 'getReceivedCheckEntityByCheckCode').mockResolvedValue({ some: 'data' })
      req.params = { checkCode: 'a41d8cb3-aba9-4960-b806-6daf7df19555' }
      await sut.getJsonReceivedCheck(req, res, next)
      expect(res.statusCode).toBe(200)
      const data = res._getJSONData()
      expect(data.some).toBe('data')
    })

    test('it sends a server error with technical message', async () => {
      const req = getRequest(getReqParams('/tech-support/received-check-json', 'GET'))
      const res = getResponse()
      jest.spyOn(checkDiagnosticService, 'getReceivedCheckEntityByCheckCode').mockRejectedValue(new Error('mock error'))
      req.params = { checkCode: 'a41d8cb3-aba9-4960-b806-6daf7df19555' }
      await sut.getJsonReceivedCheck(req, res, next)
      expect(res.statusCode).toBe(500)
      const data = res._getJSONData()
      expect(data.error).toBe('Server error: mock error')
    })
  })

  describe('/ps-report-run', () => {
    test('GET: should render page', async () => {
      const reqParams = getReqParams('/tech-support/ps-report-run', 'GET')
      const req = getRequest(reqParams)
      const res = getResponse()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getPsReportRun(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('POST: should not run report if confirmation checkbox left unticked', async () => {
      const reqParams = getReqParams('/tech-support/ps-report-run', 'GET')
      const req = getRequest(reqParams)
      req.body.runReport = undefined
      const res = getResponse()
      let responseMessage = 'not set'
      jest.spyOn(PsReportExecService, 'requestReportGeneration')
      jest.spyOn(res, 'render').mockImplementation((view, data) => {
        responseMessage = data.response
      })
      await sut.postPsReportRun(req, res, next)
      expect(responseMessage).toEqual('Report NOT Requested - checkbox tick required')
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(PsReportExecService.requestReportGeneration).not.toHaveBeenCalled()
    })

    test('POST: should run report if confirmation checkbox ticked', async () => {
      const reqParams = getReqParams('/tech-support/ps-report-run', 'GET')
      const req = getRequest(reqParams)
      req.body = {
        runReport: 'true',
        urns: undefined
      }
      const userId = 4359
      req.user = {
        id: userId
      }
      const res = getResponse()
      let responseMessage = 'not set'
      jest.spyOn(PsReportExecService, 'requestReportGeneration').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation((view, data) => {
        responseMessage = data.response
      })
      await sut.postPsReportRun(req, res, next)
      expect(responseMessage).toEqual('PS Report Requested')
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(PsReportExecService.requestReportGeneration).toHaveBeenCalledWith(userId, undefined)
    })

    test('POST: should pass URNs if inputted', async () => {
      const reqParams = getReqParams('/tech-support/ps-report-run', 'GET')
      const req = getRequest(reqParams)
      const urnList = '12345,67890'
      req.body = {
        runReport: 'true',
        urns: urnList
      }
      const userId = 4359
      req.user = {
        id: userId
      }
      const res = getResponse()
      let responseMessage = 'not set'
      jest.spyOn(PsReportExecService, 'requestReportGeneration').mockImplementation()
      jest.spyOn(res, 'render').mockImplementation((view, data) => {
        responseMessage = data.response
      })
      await sut.postPsReportRun(req, res, next)
      expect(responseMessage).toEqual('PS Report Requested')
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(PsReportExecService.requestReportGeneration).toHaveBeenCalledWith(userId, urnList)
    })
  })

  describe('/check-submit', () => {
    test('GET: should render page', async () => {
      const reqParams = getReqParams('/tech-support/check-submit', 'GET')
      const req = getRequest(reqParams)
      const res = getResponse()
      jest.spyOn(res, 'render').mockImplementation()
      await sut.getCheckSubmit(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    test('POST: should submit check to service', async () => {
      const reqParams = getReqParams('/tech-support/check-submit', 'POST')
      const req = getRequest(reqParams)
      req.body = {
        payload: 'sfsdfkdsf',
        isJson: true
      }
      const res = getResponse()
      jest.spyOn(CheckSubmitService, 'submitV3CheckPayload').mockImplementation()
      let response
      jest.spyOn(res, 'render').mockImplementation((view, data) => {
        response = data.response
      })
      await sut.postCheckSubmit(req, res, next)
      expect(response).toEqual('check submitted to service bus successfully')
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(CheckSubmitService.submitV3CheckPayload).toHaveBeenCalledWith(req.body.isJson, req.body.payload)
    })
  })
})
