'use strict'

/* global describe beforeEach jest expect test */

const httpMocks = require('node-mocks-http')
const moment = require('moment-timezone')

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const config = require('../../../config')
const controller = require('../../../controllers/results')
const groupService = require('../../../services/group.service')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const resultPageAvailabilityService = require('../../../services/results-page-availability.service')
const resultService = require('../../../services/result.service')
const ctfService = require('../../../services/ctf/ctf.service')
const checkWindowPhaseConsts = require('../../../lib/consts/check-window-phase')

describe('results controller:', () => {
  let next
  beforeEach(() => {
    next = jest.fn()
    const currentDate = moment.utc()
    jest.spyOn(moment, 'tz').mockReturnValue(currentDate)
  })

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

  describe('getViewResultsPage route', () => {
    const reqParams = {
      method: 'GET',
      url: '/results/view-results'
    }

    const mockGroups = [
      { id: 1, name: 'TG 1', pupilCount: 10 },
      { id: 2, name: 'TG 3', pupilCount: 11 }
    ]

    const mockPupilData = {
      pupils: [
        { fullName: 'Aardvark, Lucy', score: 10, status: '' },
        { fullName: 'Bee, John', score: 10, status: '' },
        { fullName: 'Cricket, Jimmy', score: '-', status: 'Left school' }
      ],
      generatedAt: moment('2020-07-01T04:12:34')
    }

    test('renders result view page', async () => {
      // Setup
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockResolvedValue(mockGroups)
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(true)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockImplementation()
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(true)
      jest.spyOn(resultService, 'getPupilResultData').mockResolvedValue(mockPupilData)

      // Exec
      await controller.getViewResultsPage(req, res, next)

      // Test
      expect(res.locals.pageTitle).toBe('Results')
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: mockPupilData.pupils,
        isHdfSubmitted: true,
        generatedAt: '1 July 2020 4:12am',
        maxMark: config.LINES_PER_CHECK_FORM,
        groups: mockGroups,
        breadcrumbs: undefined,
        checkWindowPhaseIsReadOnly: false
      })
    })

    test('calls next when getPupilResultData throws an error', async () => {
      // Setup
      const res = getRes()
      const req = getReq(reqParams)
      const mockError = new Error('mock error')
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockResolvedValue(mockGroups)
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockResolvedValue(moment('2020-07-01T04:12:34'))
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(true)
      jest.spyOn(resultService, 'getPupilResultData').mockRejectedValue(mockError)

      // Exec
      await controller.getViewResultsPage(req, res, next)

      // Test
      expect(res.locals.pageTitle).toBe('Results')
      expect(next).toHaveBeenCalledWith(mockError)
    })

    test('renders incomplete hdf page when hdf record for school is not found and current date is before second Monday after check end date', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockResolvedValue(mockGroups)
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
      jest.spyOn(resultService, 'getPupilResultData').mockResolvedValue(mockPupilData)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockReturnValue(moment('2020-01-06T06:00:00'))
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(false)

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Results')
      expect(res.render).toHaveBeenCalledWith('results/view-incomplete-hdf', {
        resultsOpeningDate: '6 January 2020', breadcrumbs: undefined
      })
    })

    test('renders results view page when hdf record for school is not found but datetime for unsubmitted hdfs has passed', async () => {
      // setup
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockResolvedValue(mockGroups)
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockImplementation()
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(true)
      jest.spyOn(resultService, 'getPupilResultData').mockReturnValue(mockPupilData)

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Results')
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: mockPupilData.pupils,
        isHdfSubmitted: false,
        generatedAt: '1 July 2020 4:12am',
        maxMark: config.LINES_PER_CHECK_FORM,
        groups: mockGroups,
        breadcrumbs: undefined,
        checkWindowPhaseIsReadOnly: false
      })
    })

    test('renders unavailable page when results page is not yet accessible', async () => {
      // setup
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockImplementation()
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(false)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(false)
      jest.spyOn(resultService, 'getPupilResultData').mockImplementation()

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Results')
      expect(res.render).toHaveBeenCalledWith('results/view-unavailable-results', { breadcrumbs: undefined })
    })

    test('renders unavailable page when getPupilResultData does not return data', async () => {
      // setup
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockReturnValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(true)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockImplementation()
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(false)
      jest.spyOn(resultService, 'getPupilResultData').mockReturnValue({ pupils: [] })

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Results')
      expect(res.render).toHaveBeenCalledWith('results/view-results-not-found', { breadcrumbs: undefined })
    })

    test('a school can download the CTF results in the Read Only period, even if they havn\'t signed the HDF', async () => {
      // setup
      global.checkWindowPhase = checkWindowPhaseConsts.readOnlyAdmin
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockReturnValue({ id: 1 })
      jest.spyOn(groupService, 'getGroups').mockImplementation()
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').mockResolvedValue(false)
      jest.spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').mockImplementation()
      jest.spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(true)
      jest.spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').mockReturnValue(true)
      jest.spyOn(resultService, 'getPupilResultData').mockReturnValue(mockPupilData)

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Results')
      expect(res.render).toHaveBeenCalledWith('results/view-results', expect.objectContaining({
        checkWindowPhaseIsReadOnly: true,
        isHdfSubmitted: false
      }))
    })
  })

  describe('getCtfDownload', () => {
    const reqParams = {
      method: 'GET',
      url: '/results/ctf-download'
    }

    test('is defined', () => {
      expect(controller.getCtfDownload).toBeDefined()
    })

    test('calls next() if the schoolId is missing', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      await controller.getCtfDownload(req, res, next)
      const error = next.mock.calls[0][0]
      expect(error.message).toBe('School ID Missing')
    })

    test('calls ctfService.getSchoolResultDataAsXmlString to get the data', async () => {
      const res = getRes()
      res.attachment = jest.fn()
      const req = getReq(reqParams)
      req.user = { schoolId: 42 }
      jest.spyOn(ctfService, 'getSchoolResultDataAsXmlString').mockReturnValue('<CTfile>mock</CTfile>')
      await controller.getCtfDownload(req, res, next)
      expect(ctfService.getSchoolResultDataAsXmlString).toHaveBeenCalled()
    })

    test('sends the download file as an attachment', async () => {
      const res = getRes()
      res.attachment = jest.fn()
      const req = getReq(reqParams)
      req.user = { schoolId: 42, School: 9991001 }
      jest.spyOn(ctfService, 'getSchoolResultDataAsXmlString').mockReturnValue('<CTfile>mock</CTfile>')
      await controller.getCtfDownload(req, res, next)
      expect(res.attachment).toHaveBeenCalledWith('9991001_MTC_9991001_001.xml')
    })

    test('sets the Content-type to text/xml', async () => {
      const res = getRes()
      res.attachment = jest.fn()
      const req = getReq(reqParams)
      req.user = { schoolId: 42 }
      jest.spyOn(ctfService, 'getSchoolResultDataAsXmlString').mockReturnValue('<CTfile>mock</CTfile>')
      await controller.getCtfDownload(req, res, next)
      expect(res.get('Content-Type')).toBe('text/xml')
    })

    test('sends the XML file out as the attachment', async () => {
      const res = getRes()
      res.attachment = jest.fn()
      res.send = jest.fn()
      const req = getReq(reqParams)
      req.user = { schoolId: 42 }
      jest.spyOn(ctfService, 'getSchoolResultDataAsXmlString').mockReturnValue('<CTfile>mock</CTfile>')
      await controller.getCtfDownload(req, res, next)
      const response = res.send.mock.calls[0][0]
      expect(response).toBe('<CTfile>mock</CTfile>')
    })

    test('calls next() if there is an error thrown from processing', async () => {
      const res = getRes()
      res.attachment = jest.fn()
      const req = getReq(reqParams)
      req.user = { schoolId: 42 }
      jest.spyOn(ctfService, 'getSchoolResultDataAsXmlString').mockRejectedValue(new Error('mock error'))
      await controller.getCtfDownload(req, res, next)
      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error.message).toBe('mock error')
    })
  })
})
