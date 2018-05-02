'use strict'
/* global describe beforeEach it expect spyOn xit */
const moment = require('moment')

const jwtService = require('../../services/jwt.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const markingService = require('../../services/marking.service')
const checkDataService = require('../../services/data-access/check.data.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const checkMock = require('../mocks/check')
const checkFormMock = require('../mocks/check-form')
const completedCheckMock = require('../mocks/completed-check')

describe('check-complete.service', () => {
  describe('happy path', () => {
    let service, completedCheckDataServiceSpy
    const pupilMock = {
      id: 1,
      school: 9991001,
      foreName: 'Pupil',
      lastName: 'One',
      pin: 4466,
      dateOfBirth: moment('2000-12-31 00:00:00'),
      urlSlug: 'EE882072-D3FC-46F6-84BC-691BFB1B5722',
      checkOptions: {
        speechSynthesis: false
      },
      isTestAccount: false
    }
    const completedCheck = {
      data: {
        pupil: {
          checkCode: 'EE882072-D3FC-46F6-84BC-734BFB1B5733'
        }
      }
    }
    beforeEach(() => {
      service = require('../../services/check-complete.service')
      const checkForm = Object.assign({}, checkFormMock)
      checkForm.formData = JSON.parse(checkForm.formData)
      spyOn(pupilDataService, 'sqlUpdate').and.returnValue(Promise.resolve())
      spyOn(pupilDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(pupilMock))
      completedCheckDataServiceSpy = spyOn(completedCheckDataService, 'sqlAddResult').and.returnValue(Promise.resolve())
      spyOn(markingService, 'mark').and.returnValue(Promise.resolve())
      spyOn(jwtService, 'decode').and.returnValue({ sub: 1 })
      spyOn(completedCheckDataService, 'sqlFindOneByCheckCode').and.returnValue(Promise.resolve(completedCheckMock))
      spyOn(checkDataService, 'sqlFindOneByCheckCode').and.returnValue(Promise.resolve(checkMock))
      spyOn(checkFormDataService, 'sqlFindOneParsedById').and.returnValue(Promise.resolve(checkForm))
    })

    it('clears pin and sets expiry when not test account', async (done) => {
      await service.completeCheck(completedCheck)
      expect(pupilDataService.sqlUpdate).toHaveBeenCalledTimes(1)
      done()
    })

    it('stores the check and marks it', async (done) => {
      await service.completeCheck(completedCheck)
      expect(completedCheckDataService.sqlAddResult).toHaveBeenCalledTimes(1)
      expect(markingService.mark).toHaveBeenCalledTimes(1)
      done()
    })

    it('passes a moment to receivedByServerAt', async (done) => {
      // override initial spyOn to callFake for parameter checking
      completedCheckDataServiceSpy.and.callFake((checkCode, completedCheck, receivedByServerAt) => {
        expect(moment.isMoment(receivedByServerAt)).toBe(true)
        return Promise.resolve()
      })

      await service.completeCheck(completedCheck)
      expect(completedCheckDataService.sqlAddResult).toHaveBeenCalledTimes(1)
      done()
    })

    xit('adds a timestamp', async (done) => {
      // TODO: Relocate this test once timestamp recording occurs in application service tier
      await service.completeCheck(completedCheck)
      // const args = spy.calls.mostRecent().args[0]
      // expect(args.hasOwnProperty('receivedByServerAt')).toBe(true)
      done()
    })
  })
})
