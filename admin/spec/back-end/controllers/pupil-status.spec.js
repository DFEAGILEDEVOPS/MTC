'use strict'

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
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(pupilStatusService, 'getPupilStatusData').mockResolvedValue([])
        jest.spyOn(pupilStatusPresenter, 'getPresentationData').mockResolvedValue([])
        jest.spyOn(res, 'render').mockImplementation()
      })

      test('should render the school pupil status', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(res.render).toHaveBeenCalled()
      })

      test('should call checkWindowV2Service getActiveCheckWindow method', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      })

      test('should call pupilStatusService getPupilStatusData method', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(pupilStatusService.getPupilStatusData).toHaveBeenCalled()
      })

      test('should call pupilStatusPresenter getPresentationData method', async () => {
        await controller.getViewPupilStatus(req, res, next)
        expect(pupilStatusPresenter.getPresentationData).toHaveBeenCalled()
      })
    })

    describe('if calls are unsuccessful', () => {
      test('should call next if pupilStatusService getPupilStatusData throws an error', async () => {
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        const error = new Error('error')
        jest.spyOn(pupilStatusService, 'getPupilStatusData').mockRejectedValue(error)
        jest.spyOn(pupilStatusPresenter, 'getPresentationData').mockImplementation()
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
