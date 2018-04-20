'use strict'
/* global describe expect it beforeEach fail spyOn */

const checkWindowsMock = require('../mocks/check-windows')
const checkWindowMock = require('../mocks/check-window')
const checkMock = require('../mocks/check')

describe('check-window.service', () => {
  let service, checkWindowDataService, checkDataService
  beforeEach(() => {
    service = require('../../services/check-window.service')
    checkWindowDataService = require('../../services/data-access/check-window.data.service')
    checkDataService = require('../../services/data-access/check.data.service')
  })

  describe('#getCurrentCheckWindowsAndCountForms', () => {
    it('should return an object with id, checkWindowName and totalForms items', async (done) => {
      spyOn(checkWindowDataService, 'sqlFindCurrentAndFutureWithFormCount').and.returnValue(checkWindowsMock)
      const result = await service.getCurrentCheckWindowsAndCountForms()
      expect(result).toBeTruthy()
      expect(result.length).toBe(3)
      expect(checkWindowDataService.sqlFindCurrentAndFutureWithFormCount).toHaveBeenCalledTimes(1)
      done()
    })
  })

  describe('#getActiveCheckWindow', () => {
    const pupilId = 1
    it('should allow pupil to login if there are active check windows', async (done) => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(checkMock)
      spyOn(checkWindowDataService, 'sqlFindOneActiveCheckWindow').and.returnValue(checkWindowMock)
      let checkWindow
      try {
        checkWindow = await service.getActiveCheckWindow(pupilId)
      } catch (error) {
        fail('not expected to throw')
      }
      expect(checkWindow).toBeDefined()
      done()
    })
    it('it should disallow pupil to login if there is no related check to the pupil', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(undefined)
      try {
        await service.getActiveCheckWindow(pupilId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('There is no check record for pupil id 1')
      }
    })
    it('it should disallow pupil to login if there are no active windows', async () => {
      spyOn(checkDataService, 'sqlFindOneForPupilLogin').and.returnValue(checkMock)
      spyOn(checkWindowDataService, 'sqlFindOneActiveCheckWindow').and.returnValue(undefined)
      try {
        await service.getActiveCheckWindow(pupilId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('There is no open check window')
      }
    })
  })
})
