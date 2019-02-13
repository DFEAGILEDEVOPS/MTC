'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const resultService = require('../../../services/result.service')
const groupService = require('../../../services/group.service')
const resultPresenter = require('../../../helpers/result-presenter')
const controller = require('../../../controllers/results')

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
      spyOn(resultService, 'getSchoolScore')
      spyOn(groupService, 'getGroups')
      spyOn(resultPresenter, 'getResultsViewData')
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).toHaveBeenCalled()
      expect(groupService.getGroups).toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalled()
    })
    it('calls next when getPupilsWithResults throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      const err = new Error('error')
      spyOn(res, 'render')
      spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({ id: 1 })
      spyOn(resultService, 'getPupilsWithResults').and.returnValue(Promise.reject(err))
      spyOn(resultService, 'getSchoolScore')
      spyOn(groupService, 'getGroups')
      spyOn(resultPresenter, 'getResultsViewData')
      await controller.getViewResultsPage(req, res, next)
      expect(res.locals.pageTitle).toBe('Provisional results')
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(resultService.getPupilsWithResults).toHaveBeenCalled()
      expect(resultService.getSchoolScore).not.toHaveBeenCalled()
      expect(groupService.getGroups).not.toHaveBeenCalled()
      expect(resultPresenter.getResultsViewData).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(err)
    })
  })
})
