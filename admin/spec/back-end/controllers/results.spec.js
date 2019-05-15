'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const moment = require('moment')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const resultService = require('../../../services/result.service')
const groupService = require('../../../services/group.service')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const resultPresenter = require('../../../helpers/result-presenter')
const controller = require('../../../controllers/results')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')

describe('results controller:', () => {
  let next
  beforeEach(() => {
    next = jasmine.createSpy('next')
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
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForSubmittedHdfs').and.returnValue(true)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForUnsubmittedHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'getScoreWithOneDecimalPlace').and.returnValue(5)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).toHaveBeenCalled()
      expect(resultPresenter.getScoreWithOneDecimalPlace).toHaveBeenCalled()
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
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForSubmittedHdfs').and.returnValue(true)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForUnsubmittedHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'getScoreWithOneDecimalPlace')
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(resultPresenter.getScoreWithOneDecimalPlace).not.toHaveBeenCalled()
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
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForSubmittedHdfs')
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForUnsubmittedHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'getScoreWithOneDecimalPlace').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).not.toHaveBeenCalled()
      expect(groupService.getGroups).not.toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).not.toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs).not.toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(resultPresenter.getScoreWithOneDecimalPlace).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(err)
    })
    it('renders unavailable page when hdf record for school is not found', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults')
      spyOn(resultService, 'getSchoolScore').and.returnValue({ score: 5.25 })
      spyOn(groupService, 'getGroups')
      spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForSubmittedHdfs').and.returnValue(true)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForUnsubmittedHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'getScoreWithOneDecimalPlace').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-unavailable-results', { breadcrumbs: undefined })
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
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForSubmittedHdfs').and.returnValue(false)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForUnsubmittedHdfs').and.returnValue(true)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'getScoreWithOneDecimalPlace').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).toHaveBeenCalled()
      expect(resultPresenter.getScoreWithOneDecimalPlace).toHaveBeenCalled()
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
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForSubmittedHdfs').and.returnValue(false)
      spyOn(schoolHomeFeatureEligibilityPresenter, 'isResultsPageAccessibleForUnsubmittedHdfs').and.returnValue(false)
      spyOn(resultPresenter, 'getResultsViewData')
      spyOn(resultPresenter, 'getScoreWithOneDecimalPlace').and.returnValue(5.2)
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(headteacherDeclarationService.isHdfSubmittedForCurrentCheck).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('results/view-unavailable-results', { breadcrumbs: undefined })
    })
  })
})
