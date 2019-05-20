'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const moment = require('moment-timezone')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const resultService = require('../../../services/result.service')
const groupService = require('../../../services/group.service')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const resultPresenter = require('../../../helpers/result-presenter')
const controller = require('../../../controllers/results')
const resultPageAvailabilityService = require('../../../services/results-page-availability.service')

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
    let reqParams = {
      method: 'GET',
      url: '/results/view-results'
    }
    it('renders result view page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore').and.returnValue(5)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).toHaveBeenCalled()
      expect(resultPresenter.formatScore).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: undefined,
        groups: undefined,
        schoolScore: 5,
        nationalScore: 5,
        breadcrumbs: undefined
      })
    })
    it('renders unavailable service page when school score is undefined', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1, adminStartDate: moment.utc().subtract(20, 'days') })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore')
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore')
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(resultPresenter.formatScore).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('availability/admin-window-unavailable', {
        isBeforeStartDate: false
      })
    })
    it('calls next when getPupilsWithResults throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const err = new Error('error')
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults').and.returnValue(Promise.reject(err))
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5.25 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).not.toHaveBeenCalled()
      expect(groupService.getGroups).not.toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).not.toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).not.toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).not.toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(resultPresenter.formatScore).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(err)
    })
    it('renders incomplete hdf page when hdf record for school is not found and current date is before second Monday after check end date', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5.25 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck')
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsOpeningDate').and.returnValue('24 July 2023')
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(resultPresenter.getResultsOpeningDate).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-incomplete-hdf', { resultsOpeningDate: '24 July 2023', breadcrumbs: undefined })
    })
    it('renders results view page when hdf record for school is not found but datetime for unsubmitted hdfs has passed', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5.25 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(true)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).toHaveBeenCalled()
      expect(resultPresenter.formatScore).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: undefined,
        groups: undefined,
        schoolScore: 5.2,
        nationalScore: 5.2,
        breadcrumbs: undefined
      })
    })
    it('renders unavailable page when results page is not yet accessible', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5.25 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(false)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-unavailable-results', { breadcrumbs: undefined })
    })
    it('renders results page if hdf has been submitted and opening day of results has just passed', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5.25 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(true)
      spyOn(resultPageAvailabilityService, 'isResultsPageAccessibleForIncompleteHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'formatScore').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsFeatureAccessible).toHaveBeenCalled()
      expect(resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-results', {
        pupilData: undefined,
        groups: undefined,
        schoolScore: 5.2,
        nationalScore: 5.2,
        breadcrumbs: undefined
      })
    })
  })
})
