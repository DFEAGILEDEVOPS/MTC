'use strict'

/* global describe beforeEach it expect jasmine spyOn */
const httpMocks = require('node-mocks-http')

const checkStartService = require('../../../services/check-start.service/check-start.service')
const dateService = require('../../../services/date.service')
const pinGenerationV2Service = require('../../../services/pin-generation-v2.service')
const pinGenerationService = require('../../../services/pin-generation.service')
const pinService = require('../../../services/pin.service')
const checkWindowSanityCheckService = require('../../../services/check-window-sanity-check.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const businessAvailabilityService = require('../../../services/business-availability.service')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const qrService = require('../../../services/qr.service')
const schoolDataService = require('../../../services/data-access/school.data.service')
const groupService = require('../../../services/group.service')
const schoolMock = require('../mocks/school')
const groupsMock = require('../mocks/groups')
const pupilPinPresenter = require('../../../helpers/pupil-pin-presenter')
const schoolService = require('../../../services/school.service')

describe('pupilPin controller:', () => {
  let next
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

  beforeEach(() => {
    next = jasmine.createSpy('next')
    spyOn(headteacherDeclarationService, 'isHdfSubmittedForCurrentCheck').and.returnValue(false)
  })

  describe('getGeneratePinsOverview route', () => {
    const goodReqParamsLive = {
      method: 'GET',
      url: '/pupil-pin/generate-live-pins-overview',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    const goodReqParamsFam = {
      method: 'GET',
      url: '/pupil-pin/generate-familiarisation-pins-overview',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    const badReqParams = {
      method: 'GET',
      url: '/pupil-pin/generate-live-pins-overview',
      params: {
        pinEnv: ''
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    describe('for live pins', () => {
      it('displays the generate pins overview page if no active pins are present', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
        spyOn(res, 'render')
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(checkWindowSanityCheckService, 'check')
        await controller(req, res, next)
        expect(res.locals.pageTitle).toBe('Generate school passwords and PINs for the official check')
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generate pins overview page if no active pins are present', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
        spyOn(res, 'render').and.returnValue(null)
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(checkWindowSanityCheckService, 'check')
        await controller(req, res, next)
        expect(res.locals.pageTitle).toBe('Generate passwords and PINs for the try it out check')
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
    })
    describe('if environment is not set', () => {
      it('should call next', async () => {
        const res = getRes()
        const req = getReq(badReqParams)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({})
        spyOn(res, 'render')
        await controller(req, res, next)
        expect(res.render).not.toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).not.toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })
  })

  describe('getGeneratePinsList route', () => {
    let controller
    const goodReqParamsLive = {
      method: 'GET',
      url: '/pupil-pin/generate-live-pins-list',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    const goodReqParamsFam = {
      method: 'GET',
      url: '/pupil-pin/generate-familiarisation-pins-list',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    const badReqParams = {
      method: 'GET',
      url: '/pupil-pin/generate-familiarisation-pins-list',
      params: {
        pinEnv: ''
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    describe('for live pins', () => {
      describe('when the school is found in the database', () => {
        beforeEach(() => {
          controller = require('../../../controllers/pupil-pin').getGeneratePinsList
          spyOn(schoolService, 'findOneById').and.returnValue(Promise.resolve(schoolMock))
        })
        it('displays the generate pins list page', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsLive)
          spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
          spyOn(pinGenerationV2Service, 'getPupilsEligibleForPinGeneration').and.returnValue(Promise.resolve({}))
          spyOn(groupService, 'findGroupsByPupil').and.returnValue(groupsMock)
          spyOn(checkWindowV2Service, 'getActiveCheckWindow')
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('Select pupils')
          expect(res.render).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        })
        it('calls next if pin generation environment is not set', async () => {
          const res = getRes()
          const req = getReq(badReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)
          expect(res.render).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
        })
      })
    })

    describe('for familiarisation pins', () => {
      describe('when the school is found in the database', () => {
        beforeEach(() => {
          controller = require('../../../controllers/pupil-pin').getGeneratePinsList
          spyOn(schoolService, 'findOneById').and.returnValue(Promise.resolve(schoolMock))
        })

        it('displays the generate pins list page', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsFam)
          spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ familiarisationPinsAvailable: true })
          spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
          spyOn(pinGenerationV2Service, 'getPupilsEligibleForPinGeneration').and.returnValue(Promise.resolve({}))
          spyOn(groupService, 'findGroupsByPupil').and.returnValue(groupsMock)
          spyOn(checkWindowV2Service, 'getActiveCheckWindow')
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('Select pupils')
          expect(res.render).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        })
      })

      describe('when the school is not found in the database', () => {
        beforeEach(() => {
          controller = require('../../../controllers/pupil-pin').getGeneratePinsList
          spyOn(checkWindowV2Service, 'getActiveCheckWindow')
          spyOn(businessAvailabilityService, 'getAvailabilityData')
          spyOn(schoolService, 'findOneById').and.returnValue(Promise.resolve(undefined))
        })

        it('it throws an error', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsFam)
          await controller(req, res, next)
          expect(next).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        })
      })
    })
  })

  describe('postGeneratePins route', () => {
    const goodReqParamsLive = {
      method: 'POST',
      url: '/pupil-pin/generate-live-pins-list',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupil: ['595cd5416e5ca13e48ed2519', '595cd5416e5ca13e48ed2520']
      }
    }
    const goodReqParamsFam = {
      method: 'POST',
      url: '/pupil-pin/generate-familiarisation-pins-list',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupil: ['595cd5416e5ca13e48ed2519', '595cd5416e5ca13e48ed2520']
      }
    }
    const badReqParams = {
      method: 'POST',
      url: '/pupil-pin/generate-familiarisation-pins-list',
      params: {
        pinEnv: ''
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupil: ['595cd5416e5ca13e48ed2519', '595cd5416e5ca13e48ed2520']
      }
    }

    describe('for live pins', () => {
      it('displays the generated pins list page after successful saving', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(schoolService, 'findOneById').and.returnValue(schoolMock)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue({ schoolPin: '', pinExpiresAt: '' })
        spyOn(schoolDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)

        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/view-and-custom-print-live-pins')
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })

      it('calls next if pin generation environment is not set', async () => {
        const res = getRes()
        const req = getReq(badReqParams)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        spyOn(res, 'redirect')
        await controller(req, res, next)
        expect(res.redirect).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })

      it('displays the generate pins list page if no pupil list is provided', async () => {
        const res = getRes()
        const req = { body: {}, params: { pinEnv: 'live' } }
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)
        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-live-pins-list')
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).not.toHaveBeenCalled()
      })

      it('calls next with an error if school is not found', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolService, 'findOneById').and.returnValue(undefined)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generated pins list page after successful saving', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolService, 'findOneById').and.returnValue(schoolMock)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue({ schoolPin: '', pinExpiresAt: '' })
        spyOn(schoolDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)

        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/view-and-custom-print-familiarisation-pins')
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })

      it('displays the generate pins list page if no pupil list is provided', async () => {
        const res = getRes()
        const req = { body: {}, params: { pinEnv: 'familiarisation' } }
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue(null)
        spyOn(res, 'redirect').and.returnValue(null)
        await controller(req, res, next)
        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-familiarisation-pins-list')
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).not.toHaveBeenCalled()
      })

      it('calls next with an error if school is not found', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'determinePinGenerationEligibility')
        spyOn(checkStartService, 'prepareCheck2')
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(schoolService, 'findOneById').and.returnValue(undefined)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })
    })
  })

  describe('getViewAndCustomPrintPins route', () => {
    const goodReqParamsLive = {
      method: 'POST',
      url: '/pupil-pin/view-and-custom-print-live-pins',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }
    const goodReqParamsFam = {
      method: 'POST',
      url: '/pupil-pin/view-and-custom-print-familiarisation-pins',
      params: {
        pinEnv: 'familiarisation'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    const badReqParamsFam = {
      method: 'POST',
      url: '/pupil-pin/view-and-custom-print-familiarisation-pins',
      params: {
        pinEnv: ''
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    describe('for live pins', () => {
      it('displays the generated pupils list and password', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue([{ id: 1 }])
        spyOn(groupService, 'findGroupsByPupil').and.returnValue([])
        spyOn(groupService, 'assignGroupsToPupils').and.returnValue([])
        spyOn(pupilPinPresenter, 'getPupilPinViewData').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(dateService, 'formatDayAndDate').and.returnValue('')
        spyOn(qrService, 'getDataURL').and.returnValue('')
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        expect(groupService.findGroupsByPupil).toHaveBeenCalled()
        expect(groupService.assignGroupsToPupils).toHaveBeenCalled()
        expect(pupilPinPresenter.getPupilPinViewData).toHaveBeenCalled()
      })
      it('should not call groupService and pupilPinPresenter methods if no pupils are found', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(groupService, 'findGroupsByPupil')
        spyOn(groupService, 'assignGroupsToPupils')
        spyOn(pupilPinPresenter, 'getPupilPinViewData').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(dateService, 'formatDayAndDate').and.returnValue('')
        spyOn(qrService, 'getDataURL').and.returnValue('')
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render')
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        expect(groupService.findGroupsByPupil).not.toHaveBeenCalled()
        expect(groupService.assignGroupsToPupils).not.toHaveBeenCalled()
        expect(pupilPinPresenter.getPupilPinViewData).not.toHaveBeenCalled()
      })
      it('calls next if error occurs', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
      it('calls next if no pin generation environment has been set', async () => {
        const res = getRes()
        const req = getReq(badReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        spyOn(res, 'render')
        await controller(req, res, next)
        expect(res.render).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })

    describe('for familiarisation pins', () => {
      it('displays the generated pupils list and password', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ livePinsAvailable: true })
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue([])
        spyOn(groupService, 'findGroupsByPupil').and.returnValue([])
        spyOn(groupService, 'assignGroupsToPupils').and.returnValue([])
        spyOn(pinService, 'getActiveSchool').and.returnValue(null)
        spyOn(dateService, 'formatDayAndDate').and.returnValue('')
        spyOn(qrService, 'getDataURL').and.returnValue('')
        spyOn(checkWindowSanityCheckService, 'check')
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
      it('calls next if error occurs', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins

        spyOn(checkWindowV2Service, 'getActiveCheckWindow')
        spyOn(businessAvailabilityService, 'getAvailabilityData').and.returnValue({ familiarisationPinsAvailable: true })
        spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
    })
  })
})
