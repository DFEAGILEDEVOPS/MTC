const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const moment = require('moment')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const checkDataService = require('../../services/data-access/check.data.service')
const pinService = require('../../services/pin.service')
const jwtService = require('../../services/jwt.service')
const pinValidator = require('../../lib/validator/pin-validator')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach, spyOn */

describe('pin.service', () => {
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })

  afterEach(() => sandbox.restore())

  describe('getPupilsWithActivePins', () => {
    let pupil1
    let pupil2
    beforeEach(() => {
      pupil1 = Object.assign({}, pupilMock)
      pupil1.pin = 'f55sg'
      pupil1.pinExpiresAt = moment().startOf('day').add(16, 'hours')
      pupil2 = Object.assign({}, pupilMock)
      pupil2._id = '595cd5416e5ca13e48ed2520'
      pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
    })
    describe('if pins are valid', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
        sandbox.mock(pupilDataService).expects('sqlFindPupilsWithActivePins').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/pupil.service', {
          '../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('it should return a list of active pupils', async () => {
        const pupils = await pinService.getPupilsWithActivePins(schoolMock._id)
        expect(pupils.length).toBe(2)
      })
    })
    describe('if pins are invalid', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
        sandbox.mock(pupilDataService).expects('sqlFindPupilsWithActivePins').resolves([])
        proxyquire('../../services/pupil.service', {
          '../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('it should return a list of active pupils', async () => {
        const pupils = await pinService.getPupilsWithActivePins(schoolMock._id)
        expect(pupils.length).toBe(0)
      })
    })
  })

  describe('getActiveSchool', () => {
    let service
    let school = Object.assign({}, schoolMock)
    school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
    describe('if pin is valid', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(school)
        sandbox.mock(pinValidator).expects('isActivePin').returns(true)
        service = proxyquire('../../services/pin.service', {
          '../../services/data-access/school.data.service': schoolDataService,
          '../../lib/validator/pin-validator': pinValidator
        })
      })
      it('it should return school object', async () => {
        const result = await service.getActiveSchool(school.id)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.schoolPin).toBeDefined()
      })
    })
    describe('if pin is invalid', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(school)
        sandbox.mock(pinValidator).expects('isActivePin').returns(false)
        service = proxyquire('../../services/pin.service', {
          '../../services/data-access/school.data.service': schoolDataService,
          '../../lib/validator/pin-validator': pinValidator
        })
      })
      it('it should return null', async () => {
        const result = await service.getActiveSchool(school.id)
        expect(result).toBeNull()
      })
    })
  })
  describe('expirePupilPin', () => {
    describe('for actual users', () => {
      beforeEach(() => {
        let pupil = Object.assign({}, pupilMock)
        sandbox.mock(pupilDataService).expects('findOne').resolves(pupil)
        sandbox.mock(jwtService).expects('decode').resolves({ sub: '49g872ebf624b75400fbee09' })
        proxyquire('../../services/pin.service', {
          '../../services/data-access/pupil.data.service': pupilDataService,
          '../../services/jwt.service': jwtService
        })
      })
      it('it expire pin and set check start time ', async () => {
        spyOn(pupilDataService, 'update').and.returnValue(null)
        spyOn(checkDataService, 'sqlUpdateCheckStartedAt').and.returnValue(null)
        await pinService.expirePupilPin('token', 'checkCode')
        expect(pupilDataService.update).toHaveBeenCalled()
        expect(checkDataService.sqlUpdateCheckStartedAt).toHaveBeenCalled()
      })
    })
    describe('for test developer users', () => {
      beforeEach(() => {
        let pupil = Object.assign({}, pupilMock)
        pupil.isTestAccount = true
        sandbox.mock(pupilDataService).expects('findOne').resolves(pupil)
        sandbox.mock(jwtService).expects('decode').resolves({ sub: '49g872ebf624b75400fbee09' })
        proxyquire('../../services/pin.service', {
          '../../services/data-access/pupil.data.service': pupilDataService,
          '../../services/jwt.service': jwtService
        })
      })
      it('it should not expire pin for developer test account', async () => {
        spyOn(pupilDataService, 'update').and.returnValue(null)
        spyOn(checkDataService, 'sqlUpdateCheckStartedAt').and.returnValue(null)
        await pinService.expirePupilPin('token', 'checkCode')
        expect(pupilDataService.update).toHaveBeenCalledTimes(0)
        expect(checkDataService.sqlUpdateCheckStartedAt).toHaveBeenCalled()
      })
    })
  })

  describe('expireMultiplePins', () => {
    it('it returns if no pupils have empty pins', async () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.pin = null
      pupil.pinExpiresAt = null
      spyOn(pupilDataService, 'findOne').and.returnValue(pupil)
      spyOn(pupilDataService, 'updateMultiple').and.returnValue(null)
      await pinService.expireMultiplePins([pupil._id])
      expect(pupilDataService.updateMultiple).toHaveBeenCalledTimes(0)
    })
    it('it calls updateMultiple method if not empty pin is found', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'findOne').and.returnValue(pupil)
      spyOn(pupilDataService, 'updateMultiple').and.returnValue(null)
      await pinService.expireMultiplePins([pupil._id])
      expect(pupilDataService.updateMultiple).toHaveBeenCalledTimes(1)
    })
  })
})
