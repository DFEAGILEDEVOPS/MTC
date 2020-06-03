'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const moment = require('moment-timezone')

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const config = require('../../../config')
const controller = require('../../../controllers/results')
const groupService = require('../../../services/group.service')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const resultPageAvailabilityService = require('../../../services/results-page-availability.service')
const resultService = require('../../../services/result.service')

describe('results controller:', () => {
  let next
  beforeEach(() => {
    next = jasmine.createSpy('next')
    const currentDate = moment.utc()
    spyOn(moment, 'tz').and.returnValue(currentDate)
  })

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991001 }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
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

    it('renders result view page', async () => {
      // Setup
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(groupService, 'getGroups').and.returnValue(mockGroups)
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultService, 'getPupilResultData').and.returnValue(mockPupilData)

      // Exec
      await controller.getViewResultsPage(req, res, next)

      // Test
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: mockPupilData.pupils,
        generatedAt: '1 July 2020 4:12am',
        maxMark: config.LINES_PER_CHECK_FORM,
        groups: mockGroups,
        breadcrumbs: undefined
      })
    })

    it('calls next when getPupilResultData throws an error', async () => {
      // Setup
      const res = getRes()
      const req = getReq(reqParams)
      const mockError = new Error('mock error')
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(groupService, 'getGroups').and.returnValue(mockGroups)
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').and.returnValue(moment('2020-07-01T04:12:34'))
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultService, 'getPupilResultData').and.throwError(mockError)

      // Exec
      await controller.getViewResultsPage(req, res, next)

      // Test
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(next).toHaveBeenCalledWith(mockError)
    })

    it('renders incomplete hdf page when hdf record for school is not found and current date is before second Monday after check end date', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(groupService, 'getGroups').and.returnValue(mockGroups)
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
      spyOn(resultService, 'getPupilResultData').and.returnValue(mockPupilData)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate').and.returnValue(moment('2020-01-06T06:00:00'))
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(false)

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(res.render).toHaveBeenCalledWith('results/view-incomplete-hdf', {
        resultsOpeningDate: '6 January 2020', breadcrumbs: undefined
      })
    })

    it('renders results view page when hdf record for school is not found but datetime for unsubmitted hdfs has passed', async () => {
      // setup
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(groupService, 'getGroups').and.returnValue(mockGroups)
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultService, 'getPupilResultData').and.returnValue(mockPupilData)

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: mockPupilData.pupils,
        generatedAt: '1 July 2020 4:12am',
        maxMark: config.LINES_PER_CHECK_FORM,
        groups: mockGroups,
        breadcrumbs: undefined
      })
    })

    it('renders unavailable page when results page is not yet accessible', async () => {
      // setup
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(false)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(false)
      spyOn(resultService, 'getPupilResultData')

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(res.render).toHaveBeenCalledWith('results/view-unavailable-results', { breadcrumbs: undefined })
    })

    it('renders unavailable page when getPupilResultData does not return data', async () => {
      // setup
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'getResultsOpeningDate')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(false)
      spyOn(resultService, 'getPupilResultData').and.returnValue({ pupils: [] })

      // exec
      await controller.getViewResultsPage(req, res, next)

      // test
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(res.render).toHaveBeenCalledWith('results/view-results-not-found', { breadcrumbs: undefined })
    })
  })
})
