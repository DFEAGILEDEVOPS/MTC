'use strict'

/* global describe beforeEach expect test jest afterEach */
const httpMocks = require('node-mocks-http')

const businessAvailabilityService = require('../../../services/business-availability.service')
const checkStartService = require('../../../services/check-start/check-start.service')
const checkWindowSanityCheckService = require('../../../services/check-window-sanity-check.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const dateService = require('../../../services/date.service')
const groupService = require('../../../services/group.service')
const pinGenerationV2Service = require('../../../services/pin-generation-v2.service')
const pinService = require('../../../services/pin.service')
const pupilPinPresenter = require('../../../helpers/pupil-pin-presenter')
const qrService = require('../../../services/qr.service')
const schoolService = require('../../../services/school.service')

const groupsMock = require('../mocks/groups')
const schoolMock = require('../mocks/school')
const moment = require('moment-timezone')
const config = require('../../../config')

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
      test('displays the generate pins overview page if no active pins are present', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
        jest.spyOn(res, 'render').mockImplementation()
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockResolvedValue([])
        jest.spyOn(checkWindowSanityCheckService, 'check').mockImplementation()

        await controller(req, res, next)

        expect(res.locals.pageTitle).toBe('Generate school passwords and PINs for the official check')
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
    })

    describe('for familiarisation pins', () => {
      test('displays the generate pins overview page if no active pins are present', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
        jest.spyOn(res, 'render').mockImplementation()
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockResolvedValue([])
        jest.spyOn(checkWindowSanityCheckService, 'check').mockImplementation()

        await controller(req, res, next)

        expect(res.locals.pageTitle).toBe('Generate passwords and PINs for the try it out check')
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
    })

    describe('if environment is not set', () => {
      test('should call next', async () => {
        const res = getRes()
        const req = getReq(badReqParams)
        const controller = require('../../../controllers/pupil-pin').getGeneratePinsOverview
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({})
        jest.spyOn(res, 'render').mockImplementation()

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
          jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
        })

        test('displays the generate pins list page', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsLive)
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
          jest.spyOn(pinGenerationV2Service, 'getPupilsEligibleForPinGeneration').mockResolvedValue({})
          jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue(groupsMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(res, 'render').mockImplementation()

          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Select pupils')
          expect(res.render).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        })

        test('calls next if pin generation environment is not set', async () => {
          const res = getRes()
          const req = getReq(badReqParams)
          jest.spyOn(res, 'render').mockImplementation()
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
          jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
        })

        test('displays the generate pins list page', async () => {
          const res = getRes()
          const req = getReq(goodReqParamsFam)
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ familiarisationPinsAvailable: true })
          jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
          jest.spyOn(pinGenerationV2Service, 'getPupilsEligibleForPinGeneration').mockResolvedValue({})
          jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue(groupsMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(res, 'render').mockImplementation()
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
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockImplementation()
          jest.spyOn(schoolService, 'findOneById').mockResolvedValue(undefined)
        })

        test('it throws an error', async () => {
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
      test('displays the generated pins list page after successful saving', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(checkStartService, 'prepareCheck2').mockImplementation()
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
        jest.spyOn(res, 'redirect').mockImplementation()

        await controller(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/view-and-custom-print-live-pins')
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })

      test('calls next if pin generation environment is not set', async () => {
        const res = getRes()
        const req = getReq(badReqParams)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        jest.spyOn(res, 'redirect').mockImplementation()
        await controller(req, res, next)
        expect(res.redirect).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })

      test('displays the generate pins list page if no pupil list is provided', async () => {
        const res = getRes()
        const req = { body: {}, params: { pinEnv: 'live' } }
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(checkStartService, 'prepareCheck2').mockImplementation()
        jest.spyOn(res, 'redirect').mockImplementation()

        await controller(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-live-pins-list')
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).not.toHaveBeenCalled()
      })

      test('calls next with an error if school is not found', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins

        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(checkStartService, 'prepareCheck2').mockImplementation()
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(undefined) // school not found

        await controller(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })
    })

    describe('for familiarisation pins', () => {
      test('displays the generated pins list page after successful saving', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(checkStartService, 'prepareCheck2').mockImplementation()
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(schoolMock)
        jest.spyOn(res, 'redirect').mockImplementation()

        await controller(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/view-and-custom-print-familiarisation-pins')
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).toHaveBeenCalled()
      })

      test('displays the generate pins list page if no pupil list is provided', async () => {
        const res = getRes()
        const req = { body: {}, params: { pinEnv: 'familiarisation' } }
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(checkStartService, 'prepareCheck2').mockImplementation()
        jest.spyOn(res, 'redirect').mockImplementation()

        await controller(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-familiarisation-pins-list')
        expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
        expect(businessAvailabilityService.determinePinGenerationEligibility).not.toHaveBeenCalled()
      })

      test('calls next with an error if school is not found', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').postGeneratePins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'determinePinGenerationEligibility').mockImplementation()
        jest.spyOn(checkStartService, 'prepareCheck2').mockImplementation()
        jest.spyOn(schoolService, 'findOneById').mockResolvedValue(undefined)

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

    describe('without env dependency', () => {
      test('sets up the pupilAliasOrName property on each pupil sent to the renderer', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        const mockPupils = [
          {
            id: 1,
            foreName: 'Onefore',
            lastName: 'Onelast',
            middleNames: '',
            foreNameAlias: 'Oneforealias',
            lastNameAlias: null,
            dateOfBirth: moment()
          },
          {
            id: 2,
            foreName: 'Twofore',
            lastName: 'Twolast',
            middleNames: '',
            foreNameAlias: null,
            lastNameAlias: 'Twolastalias',
            dateOfBirth: moment()
          },
          {
            id: 3,
            foreName: 'Threefore',
            lastName: 'Threelast',
            middleNames: '',
            foreNameAlias: 'Threeforealias',
            lastNameAlias: 'Threelastalias',
            dateOfBirth: moment()
          },
          {
            id: 4,
            foreName: 'Fourfore',
            lastName: 'Fourlast',
            middleNames: '',
            foreNameAlias: null,
            lastNameAlias: null,
            dateOfBirth: moment()
          }
        ]

        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ familiarisationPinsAvailable: true })
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockResolvedValue(mockPupils)
        jest.spyOn(pinService, 'getActiveSchool').mockResolvedValue({ name: 'mock school' })
        jest.spyOn(checkWindowSanityCheckService, 'check').mockResolvedValue(undefined)
        jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue([])
        jest.spyOn(qrService, 'getDataURL').mockResolvedValue('test')
        const renderSpy = jest.spyOn(res, 'render').mockImplementation()

        await controller(req, res, next)

        const dataPassedToRender = renderSpy.mock.calls[0][1]
        expect(dataPassedToRender.pupils[0].pupilViewFullName).toBe('Fourlast, Fourfore') // no alias
        expect(dataPassedToRender.pupils[1].pupilViewFullName).toBe('Onelast, Oneforealias') // forename alias only
        expect(dataPassedToRender.pupils[2].pupilViewFullName).toBe('Threelastalias, Threeforealias') // both aliases
        expect(dataPassedToRender.pupils[3].pupilViewFullName).toBe('Twolastalias, Twofore') // forename alias only
        expect(qrService.getDataURL).toHaveBeenCalledWith(`${config.PUPIL_APP_URL}${config.Data.QrCodePupilAppPath}`)
      })
    })

    describe('for live pins', () => {
      test('displays the generated pupils list and password', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockResolvedValue([{ id: 1 }])
        jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue([])
        jest.spyOn(groupService, 'assignGroupsToPupils').mockResolvedValue([])
        jest.spyOn(pupilPinPresenter, 'getPupilPinViewData').mockResolvedValue([])
        jest.spyOn(pinService, 'getActiveSchool').mockResolvedValue(null)
        jest.spyOn(dateService, 'formatDayAndDate').mockResolvedValue('')
        jest.spyOn(qrService, 'getDataURL').mockResolvedValue('')
        jest.spyOn(checkWindowSanityCheckService, 'check').mockImplementation()
        jest.spyOn(res, 'render').mockImplementation()

        await controller(req, res, next)

        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        expect(groupService.findGroupsByPupil).toHaveBeenCalled()
        expect(groupService.assignGroupsToPupils).toHaveBeenCalled()
        expect(pupilPinPresenter.getPupilPinViewData).toHaveBeenCalled()
      })

      test('should not call groupService and pupilPinPresenter methods if no pupils are found', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockResolvedValue([]) // no pupils found
        jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue([])
        jest.spyOn(groupService, 'assignGroupsToPupils').mockResolvedValue([])
        jest.spyOn(pupilPinPresenter, 'getPupilPinViewData').mockResolvedValue([])
        jest.spyOn(pinService, 'getActiveSchool').mockImplementation()
        jest.spyOn(dateService, 'formatDayAndDate').mockReturnValue('')
        jest.spyOn(qrService, 'getDataURL').mockResolvedValue('')
        jest.spyOn(checkWindowSanityCheckService, 'check').mockImplementation()
        jest.spyOn(res, 'render')

        await controller(req, res, next)

        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
        expect(groupService.findGroupsByPupil).not.toHaveBeenCalled()
        expect(groupService.assignGroupsToPupils).not.toHaveBeenCalled()
        expect(pupilPinPresenter.getPupilPinViewData).not.toHaveBeenCalled()
      })

      test('calls next if error occurs', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsLive)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockRejectedValue(new Error('error'))

        await controller(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })

      test('calls next if no pin generation environment has been set', async () => {
        const res = getRes()
        const req = getReq(badReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins
        jest.spyOn(res, 'render').mockImplementation()

        await controller(req, res, next)

        expect(res.render).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
      })
    })

    describe('for familiarisation pins', () => {
      test('displays the generated pupils list and password', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins

        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ livePinsAvailable: true })
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockResolvedValue([])
        jest.spyOn(groupService, 'findGroupsByPupil').mockResolvedValue([])
        jest.spyOn(groupService, 'assignGroupsToPupils').mockResolvedValue([])
        jest.spyOn(pinService, 'getActiveSchool').mockResolvedValue(null)
        jest.spyOn(dateService, 'formatDayAndDate').mockResolvedValue('')
        jest.spyOn(qrService, 'getDataURL').mockResolvedValue('')
        jest.spyOn(checkWindowSanityCheckService, 'check').mockImplementation()
        jest.spyOn(res, 'render').mockImplementation()
        await controller(req, res, next)
        expect(res.render).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })

      test('calls next if error occurs', async () => {
        const res = getRes()
        const req = getReq(goodReqParamsFam)
        const controller = require('../../../controllers/pupil-pin.js').getViewAndCustomPrintPins

        jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
        jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ familiarisationPinsAvailable: true })
        jest.spyOn(pinGenerationV2Service, 'getPupilsWithActivePins').mockRejectedValue(new Error('error'))
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      })
    })
  })
})
