'use strict'

/* global describe beforeEach afterEach it expect jasmine spyOn */
const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')

const checkStartService = require('../../services/check-start.service')
const config = require('../../config')
const dateService = require('../../services/date.service')
const pinGenerationService = require('../../services/pin-generation.service')
const pinService = require('../../services/pin.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const qrService = require('../../services/qr.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const sortingAttributesService = require('../../services/sorting-attributes.service')
const groupService = require('../../services/group.service')
const schoolMock = require('../mocks/school')
const groupsMock = require('../mocks/groups')

describe('pupilPin controller:', () => {
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

  describe('getGeneratePinsOverview route', () => {
    let sandbox
    let goodReqParams = {
      method: 'GET',
      url: '/pupil-pin/generate-pins-overview',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('displays the generate pins overview page if no active pins are present', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/pupil-pin').getGeneratePinsOverview
      spyOn(res, 'render').and.returnValue(null)
      spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
      await controller(req, res)
      expect(res.locals.pageTitle).toBe('Generate pupil PINs')
      expect(res.render).toHaveBeenCalled()
      done()
    })
    it('displays the generated pins list page if active pins are present', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/pupil-pin').getGeneratePinsOverview
      spyOn(res, 'redirect').and.returnValue(null)
      spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([ '1', '2' ])
      await controller(req, res)
      expect(res.redirect).toHaveBeenCalled()
      done()
    })
  })

  describe('getGeneratePinsList route', () => {
    let sandbox
    let next
    let controller
    let goodReqParams = {
      method: 'GET',
      url: '/pupil-pin/generate-pins-list',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(schoolMock)
        controller = proxyquire('../../controllers/pupil-pin.js', {
          '../../services/data-access/school.data.service': schoolDataService
        }).getGeneratePinsList
      })

      it('displays the generate pins list page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(pinGenerationService, 'getPupils').and.returnValue(Promise.resolve({}))
        spyOn(sortingAttributesService, 'getAttributes')
          .and.returnValue({
            htmlSortDirection: { lastName: 'asc' },
            arrowSortDirection: { lastName: 'sort' }
          })
        spyOn(groupService, 'findGroupsByPupil').and.returnValue(groupsMock)
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.locals.pageTitle).toBe('Select pupils')
        expect(res.render).toHaveBeenCalled()
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(undefined)
        controller = proxyquire('../../controllers/pupil-pin.js', {
          '../../services/data-access/school.data.service': schoolDataService
        }).getGeneratePinsList
      })
      it('it throws an error', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('postGeneratePins route', () => {
    let next
    let goodReqParams = {
      method: 'POST',
      url: '/pupil-pin/generate-pins-list',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupil: [ '595cd5416e5ca13e48ed2519', '595cd5416e5ca13e48ed2520' ]
      }
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    it('displays the generated pins list page after successful saving', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/pupil-pin.js').postGeneratePins

      spyOn(checkStartService, 'prepareCheck')
      spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
      spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(schoolMock)
      spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue({ schoolPin: '', pinExpiresAt: '' })
      spyOn(schoolDataService, 'sqlUpdate').and.returnValue(null)
      spyOn(res, 'redirect').and.returnValue(null)

      await controller(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generated-pins-list')
      done()
    })

    it('displays the generate pins list page if no pupil list is provided', async (done) => {
      const res = getRes()
      const req = { body: {} }
      const controller = require('../../controllers/pupil-pin.js').postGeneratePins
      spyOn(checkStartService, 'prepareCheck')
      spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
      spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
      spyOn(pinGenerationService, 'generateSchoolPassword').and.returnValue(null)
      spyOn(res, 'redirect').and.returnValue(null)
      await controller(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/pupil-pin/generate-pins-list')
      done()
    })

    it('calls next with an error if school is not found', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/pupil-pin.js').postGeneratePins
      spyOn(checkStartService, 'prepareCheck')
      spyOn(pinGenerationService, 'updatePupilPins').and.returnValue(null)
      spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(undefined)
      await controller(req, res, next)
      expect(next).toHaveBeenCalled()
      done()
    })
  })

  describe('getGeneratedPins route', () => {
    let sandbox
    let next
    let goodReqParams = {
      method: 'POST',
      url: '/pupil-pin/generate-pins-list',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })
    it('displays the generated pupils list and password', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/pupil-pin.js').getGeneratedPinsList
      spyOn(pinService, 'getPupilsWithActivePins').and.returnValue(null)
      spyOn(pinService, 'getActiveSchool').and.returnValue(null)
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res, next)
      expect(res.render).toHaveBeenCalled()
      done()
    })
    it('calls next if error occurs', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const controller = require('../../controllers/pupil-pin.js').getGeneratedPinsList
      spyOn(pinService, 'getPupilsWithActivePins').and.returnValue(Promise.reject(new Error('error')))
      await controller(req, res, next)
      expect(next).toHaveBeenCalled()
      done()
    })
  })

  describe('getPrintPins route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/pupil/download-error-csv',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil-pin.js').getPrintPins
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('returns data for the print page', async (done) => {
      spyOn(groupService, 'getGroupsAsArray').and.returnValue('')
      spyOn(dateService, 'formatDayAndDate').and.returnValue('')
      spyOn(pinService, 'getPupilsWithActivePins').and.returnValue([])
      spyOn(pinService, 'getActiveSchool').and.returnValue({})
      spyOn(qrService, 'getDataURL').and.returnValue('')
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.returnValue(null)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.render).toHaveBeenCalledWith('pupil-pin/pin-print', {
        pupils: [],
        school: {},
        date: '',
        qrDataURL: '',
        url: config.PUPIL_APP_URL
      })
      done()
    })
  })
})
