const moment = require('moment')
const proxyquire = require('proxyquire').noCallThru()
const R = require('ramda')
const sinon = require('sinon')

const checkDataService = require('../../services/data-access/check.data.service')
const jwtService = require('../../services/jwt.service')
const pinService = require('../../services/pin.service')
const dateService = require('../../services/date.service')
const pinValidator = require('../../lib/validator/pin-validator')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilIdentificationFlagService = require('../../services/pupil-identification-flag.service')
const pupilMock = require('../mocks/pupil')
const schoolDataService = require('../../services/data-access/school.data.service')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach, spyOn */

describe('pin.service', () => {
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })

  afterEach(() => sandbox.restore())

  describe('getPupilsWithActivePins', () => {
    let pupil1
    let pupil2
    const service = require('../../services/pin.service')
    const dfeNumber = 9991999

    beforeEach(() => {
      pupil1 = Object.assign({}, pupilMock)
      pupil1.pin = 'f55sg'
      pupil1.pinExpiresAt = moment().startOf('day').add(16, 'hours')
      pupil2 = Object.assign({}, pupilMock)
      pupil2._id = '595cd5416e5ca13e48ed2520'
      pupil2.id = 43
      pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
    })
    it('makes a call to get the pupils with active pins', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([]))
      spyOn(dateService, 'formatShortGdsDate').and.returnValue('9 Sep 2008')
      await service.getPupilsWithActivePins(dfeNumber)
      expect(pupilDataService.sqlFindPupilsWithActivePins).toHaveBeenCalledWith(dfeNumber)
    })

    it('Adds identification flags to the pupil when they have the same name', async () => {
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([pupil1, pupil2]))
      spyOn(dateService, 'formatShortGdsDate').and.returnValue('9 Sep 2008')
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags').and.callThrough()
      const data = await service.getPupilsWithActivePins(dfeNumber)
      // Because we used the pupil mock we expect the pupils to have the same name, so we need
      // show the dob to differentiate.
      expect(data[0].showDoB).toBe(true)
      expect(data[1].showDoB).toBe(true)
    })

    it('does not add identification flags to the pupil when they have different names', async () => {
      const p1 = R.clone(pupilMock)
      const p2 = R.clone(pupilMock)
      p2.lastName = 'Sherlock'
      spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(Promise.resolve([p1, p2]))
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags').and.callThrough()
      const data = await service.getPupilsWithActivePins(dfeNumber)
      expect(data[0].showDoB).toBeUndefined()
      expect(data[1].showDoB).toBeUndefined()
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
        sandbox.mock(pupilDataService).expects('sqlFindOneById').resolves(pupil)
        sandbox.mock(jwtService).expects('decode').resolves({ sub: '49g872ebf624b75400fbee09' })
        proxyquire('../../services/pin.service', {
          '../../services/data-access/pupil.data.service': pupilDataService,
          '../../services/jwt.service': jwtService
        })
      })
      it('it expire pin and set check start time ', async () => {
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(checkDataService, 'sqlUpdateCheckStartedAt').and.returnValue(null)
        await pinService.expirePupilPin('token', 'checkCode')
        expect(pupilDataService.sqlUpdate).toHaveBeenCalled()
        expect(checkDataService.sqlUpdateCheckStartedAt).toHaveBeenCalled()
      })
    })
    describe('for test developer users', () => {
      beforeEach(() => {
        let pupil = Object.assign({}, pupilMock)
        pupil.isTestAccount = true
        sandbox.mock(pupilDataService).expects('sqlFindOneById').resolves(pupil)
        sandbox.mock(jwtService).expects('decode').resolves({ sub: '49g872ebf624b75400fbee09' })
        proxyquire('../../services/pin.service', {
          '../../services/data-access/pupil.data.service': pupilDataService,
          '../../services/jwt.service': jwtService
        })
      })
      it('it should not expire pin for developer test account', async () => {
        spyOn(pupilDataService, 'sqlUpdate').and.returnValue(null)
        spyOn(checkDataService, 'sqlUpdateCheckStartedAt').and.returnValue(null)
        await pinService.expirePupilPin('token', 'checkCode')
        expect(pupilDataService.sqlUpdate).toHaveBeenCalledTimes(0)
        expect(checkDataService.sqlUpdateCheckStartedAt).toHaveBeenCalled()
      })
    })
  })

  describe('expireMultiplePins', () => {
    it('it returns if no pupils have empty pins', async () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.pin = null
      pupil.pinExpiresAt = null
      spyOn(pupilDataService, 'sqlFindByIds').and.returnValue([pupil])
      spyOn(pupilDataService, 'sqlUpdatePinsBatch').and.returnValue(null)
      await pinService.expireMultiplePins([pupil._id])
      expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(0)
    })
    it('it calls updateMultiple method if not empty pin is found', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilDataService, 'sqlFindByIds').and.returnValue([pupil])
      spyOn(pupilDataService, 'sqlUpdatePinsBatch').and.returnValue(null)
      await pinService.expireMultiplePins([pupil._id])
      expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(1)
    })
  })
})
