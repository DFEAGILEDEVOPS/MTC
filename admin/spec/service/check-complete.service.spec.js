'use strict'
/* global describe beforeEach it expect spy   spyOn xit */

const jwtService = require('../../services/jwt.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const markingService = require('../../services/marking.service')
const moment = require('moment')

describe('check-complete.service', () => {
  describe('happy path', () => {
    let service
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
      spyOn(pupilDataService, 'sqlUpdate').and.returnValue(Promise.resolve())
      spyOn(pupilDataService, 'sqlFindOneById').and.returnValue(Promise.resolve(pupilMock))
      spyOn(completedCheckDataService, 'sqlAddResult').and.returnValue(Promise.resolve())
      spyOn(markingService, 'mark').and.returnValue(Promise.resolve())
      spyOn(jwtService, 'decode').and.returnValue({ sub: 1 })
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

    xit('adds a timestamp', async (done) => {
      // TODO: Relocate this test once timestamp recording occurs in application service tier
      await service.completeCheck(completedCheck)
      const args = spy.calls.mostRecent().args[0]
      expect(args.hasOwnProperty('receivedByServerAt')).toBe(true)
      done()
    })
  })
})
