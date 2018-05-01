const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const checkDataService = require('../../services/data-access/check.data.service')
const jwtService = require('../../services/jwt.service')
const pinService = require('../../services/pin.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')

const pupilMock = require('../mocks/pupil')

/* global describe, it, expect, beforeEach, afterEach, spyOn */

describe('pin.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

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
})
