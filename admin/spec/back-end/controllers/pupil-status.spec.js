'use strict'

/* global describe it expect jasmine beforeEach spyOn */

const controller = require('../../../controllers/pupil-status')
const pupilStatusService = require('../../../services/pupil-status.service')

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
      url: '/pupil-status'
    }
    it('should render the school pupil status', async () => {
      const req = getReq(reqParams)
      const res = getRes()
      spyOn(pupilStatusService, 'getPupilStatusData')
      spyOn(res, 'render')
      await controller.getViewPupilStatus(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
  })
})
