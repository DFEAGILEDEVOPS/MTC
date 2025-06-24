'use strict'
const httpMocks = require('node-mocks-http')
const sut = require('../../../controllers/pupil-register')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const businessAvailabilityService = require('../../../services/business-availability.service')
const checkWindowPhaseConsts = require('../../../lib/consts/check-window-phase')
const pupilRegisterV2Service = require('../../../services/pupil-register-v2.service')
const userRoles = require('../../../lib/consts/roles')

describe('pupil-register controller:', () => {
  let next
  const mockAvailabilityDataHdfSubmitted = {
    hdfSubmitted: true
  }
  const mockAvailablilityDataHdfNotSubmitted = {
    hdfSubmitted: false
  }

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
    jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
    jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue(mockAvailablilityDataHdfNotSubmitted)
    jest.spyOn(pupilRegisterV2Service, 'getPupilRegister').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('showAddPupilButtons', () => {
    const goodReqParamsLive = {
      method: 'GET',
      url: '/pupil-register/list-pupils',
      params: {
        pinEnv: 'live'
      },
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    test('during the pre start check window phase the add pupil buttons are available', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.preStart
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(true)
    })

    test('during the try it out check window phase the add pupil buttons are available', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.tryItOut
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(true)
    })

    test('during the live check window phase the add pupil buttons are available', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.officialCheck
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(true)
    })

    test('during the post check window phase the add pupil buttons are available', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.postCheckAdmin
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(true)
    })

    test('during the post check window phase the add pupil button is available for STA-ADMIN', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.postCheckAdmin
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      req.user.role = userRoles.staAdmin
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(true)
    })

    test('during the post check window phase (readonly mode) the add pupil buttons are not available', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.readOnlyAdmin
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(false)
      expect(args[1].showAddMultiplePupilButton).toBe(false)
    })

    test('during the post check window phase (readonly mode) the add pupil button is available for STA-ADMIN', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.readOnlyAdmin
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      req.user.role = userRoles.staAdmin
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(false)
    })

    test('during the post check window phase (unavailable mode) the add pupil buttons are not available', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.unavailable
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(false)
      expect(args[1].showAddMultiplePupilButton).toBe(false)
    })

    test('during the post check window phase (unavailable mode) the add pupil button is available for STA-ADMINs', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.unavailable
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      req.user.role = userRoles.staAdmin
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(true)
      expect(args[1].showAddMultiplePupilButton).toBe(false)
    })

    test('during the live check window the add pupil buttons are not available if the HDF is signed', async () => {
      global.checkWindowPhase = checkWindowPhaseConsts.officialCheck
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue(mockAvailabilityDataHdfSubmitted)
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      req.user.role = userRoles.teacher
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      const args = renderSpy.mock.calls[0]
      expect(args[1].showAddPupilButton).toBe(false)
      expect(args[1].showAddMultiplePupilButton).toBe(false)
    })

    async function testRoleAgainstLink (role) {
      global.checkWindowPhase = checkWindowPhaseConsts.officialCheck
      const res = getRes()
      const renderSpy = jest.spyOn(res, 'render')
      const req = getReq(goodReqParamsLive)
      req.user.role = role
      await sut.listPupils(req, res, next)
      expect(res.render).toHaveBeenCalledTimes(1)
      return renderSpy.mock.calls[0]
    }

    test('the view pupil history link is visible to STA admin', async () => {
      const args = await testRoleAgainstLink(userRoles.staAdmin)
      expect(args[1].showPupilAdminLink).toBe(true)
    })

    test('the view pupil history link is visible to helpdesk', async () => {
      const args = await testRoleAgainstLink(userRoles.helpdesk)
      expect(args[1].showPupilAdminLink).toBe(true)
    })

    test('the view pupil history link is not visible to teacher', async () => {
      const args = await testRoleAgainstLink(userRoles.teacher)
      expect(args[1].showPupilAdminLink).toBe(false)
    })
  })
})
