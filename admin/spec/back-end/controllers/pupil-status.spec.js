'use strict'

/* global describe it expect jasmine beforeEach spyOn */

const controller = require('../../../controllers/pupil-status')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const pupilStatusService = require('../../../services/pupil-status.service')
const pupilStatusPresenter = require('../../../helpers/pupil-status-presenter')

const httpMocks = require('node-mocks-http')

describe('pupil status controller', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = params.user || { School: 9991001 }
    req.session = params.session || {}
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }
  beforeEach(() => {
    next = jasmine.createSpy('next')
  })
  describe('getViewPupilStatus', () => {
    const reqParams = {
      method: 'GET',
      url: '/pupil-status',
      user: {
        schoolId: 1
      }
    }
    let req
    let res
    describe('if all calls are successful', () => {
      beforeEach(() => {
        req = getReq(reqParams)
        res = getRes()
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(pupilStatusPresenter, 'getPresentationData')
        spyOn(pupilStatusService, 'getPupilStatusData')
        spyOn(res, 'render')
      })
      it('should render the school pupil status', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(res.render).toHaveBeenCalled()
      })
      it('should call checkWindowV2Service getActiveCheckWindow method', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      })
      it('should call pupilStatusService getPupilStatusData method', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(pupilStatusService.getPupilStatusData).toHaveBeenCalled()
      })
      it('should call pupilStatusPresenter getPresentationData method', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(pupilStatusPresenter.getPresentationData).toHaveBeenCalled()
      })
    })
    describe('if calls are unsuccessful', () => {
      it('should call next if pupilStatusService getPupilStatusData throws an error', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(pupilStatusPresenter, 'getPresentationData')
        const error = new Error('error')
        spyOn(pupilStatusService, 'getPupilStatusData').and.returnValue(Promise.reject(error))
        try {
          await controller.getViewPupilStatus(req, res, next)
        } catch (error) {
          expect(error.message).toBe('error')
        }
        expect(pupilStatusPresenter.getPresentationData).not.toHaveBeenCalled()
      })
    })
  })
})
