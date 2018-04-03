'use strict'
/* global describe expect it beforeEach fail spyOn */

const checkFormMock = require('../mocks/check-form')
const checkWindowsMock = require('../mocks/check-windows')
const checkWindowMock = require('../mocks/check-window')
const checkMock = require('../mocks/check')
const moment = require('moment')

describe('check-window.service', () => {
  let service, checkWindowDataService, checkFormDataService, checkDataService
  beforeEach(() => {
    service = require('../../services/check-window.service')
    checkWindowDataService = require('../../services/data-access/check-window.data.service')
    checkFormDataService = require('../../services/data-access/check-form.data.service')
    checkDataService = require('../../services/data-access/check.data.service')
  })

  describe('getAllCheckWindows', () => {
    it('should return dates correctly formatted', async () => {
      spyOn(checkWindowDataService, 'sqlFindAllCheckWindows').and.returnValue([
        {
          id: 1,
          checkEndDate: moment('2018-01-20 00:00:00'),
          checkStartDate: moment('2018-01-10 00:00:00'),
          adminStartDate: moment('2017-10-18 00:00:00'),
          name: 'Test window 3',
          formCount: 2,
          isDeleted: false
        }
      ])
      const checkWindows = await service.getAllCheckWindows('checkWindowName', 'asc')

      expect(checkWindows[0].name).toBe('Test window 3')
      expect(checkWindows[0].adminStartDate).toBe('18 Oct 2017')
      expect(checkWindows[0].checkDates).toBe('10 Jan to 20 Jan 2018')
    })

    it('should set canRemove to false and isCurrent to false when checkwindow is in the past', async () => {
      spyOn(checkWindowDataService, 'sqlFindAllCheckWindows').and.returnValue([
        {
          id: 1,
          checkEndDate: moment().subtract(1, 'day'),
          checkStartDate: moment().subtract(2, 'day'),
          adminStartDate: moment().subtract(3, 'day'),
          name: 'Test window 3',
          formCount: 2,
          isDeleted: false
        }
      ])
      const checkWindows = await service.getAllCheckWindows('checkWindowName', 'asc')
      expect(checkWindows[0].canRemove).toBeFalsy()
      expect(checkWindows[0].isPast).toBeTruthy()
    })

    it('should set canRemove to true and isCurrent to false when checkwindow is in the future', async () => {
      spyOn(checkWindowDataService, 'sqlFindAllCheckWindows').and.returnValue([
        {
          id: 1,
          checkEndDate: moment().add(3, 'day'),
          checkStartDate: moment().add(2, 'day'),
          adminStartDate: moment().add(1, 'day'),
          name: 'Test window 3',
          formCount: 2,
          isDeleted: false
        }
      ])
      const checkWindows = await service.getAllCheckWindows('checkWindowName', 'asc')
      expect(checkWindows[0].canRemove).toBeTruthy()
      expect(checkWindows[0].isPast).toBeFalsy()
    })

    it('should set canRemove to false and isCurrent to true when checkwindow starts today', async () => {
      spyOn(checkWindowDataService, 'sqlFindAllCheckWindows').and.returnValue([
        {
          id: 1,
          checkEndDate: moment().add(7, 'day'),
          checkStartDate: moment(),
          adminStartDate: moment().subtract(5, 'day'),
          name: 'Today window',
          formCount: 2,
          isDeleted: false
        }
      ])
      const checkWindows = await service.getAllCheckWindows('checkWindowName', 'asc')
      expect(checkWindows[0].canRemove).toBeFalsy()
      expect(checkWindows[0].isPast).toBeFalsy()
    })
    it('should throw an error if a check window start date is after check window end date', async () => {
      spyOn(checkWindowDataService, 'sqlFindAllCheckWindows').and.returnValue([
        {
          id: 1,
          checkEndDate: moment(),
          checkStartDate: moment().add(7, 'day'),
          adminStartDate: moment().subtract(5, 'day'),
          name: 'Today window',
          formCount: 2,
          isDeleted: false
        }
      ])
      try {
        await service.getAllCheckWindows('checkWindowName', 'asc')
        fail()
      } catch (error) {
        expect(error.message).toBe('Check start date is after check end date')
      }
    })
  })

  describe('markAsDeleted - happy path', () => {
    it('should mark a form as soft deleted if no check window was assigned or was assigned but have not started', async (done) => {
      spyOn(checkWindowDataService, 'sqlFindCheckWindowsAssignedToForms').and.returnValue([])
      spyOn(checkFormDataService, 'sqlMarkFormAsDeleted').and.returnValue(Promise.resolve())
      await service.markAsDeleted(checkFormMock)
      expect(checkFormDataService.sqlMarkFormAsDeleted).toHaveBeenCalledWith(checkFormMock.id)
      done()
    })
  })

  describe('markAsDeleted - unhappy path', () => {
    describe('If the argument has no data', () => {
      it('should return an error if the argument does not contain an id', async (done) => {
        checkFormMock.id = undefined
        try {
          await service.markAsDeleted(checkFormMock)
          fail('error should have been thrown')
          done()
        } catch (error) {
          expect(error.message).toBe('Form with an id is required')
          done()
        }
      })
    })

    describe('If saving documents fails', () => {
      it('should return an error', async (done) => {
        try {
          spyOn(checkWindowDataService, 'sqlFindCheckWindowsAssignedToForms').and.returnValue([])
          spyOn(checkFormDataService, 'sqlMarkFormAsDeleted').and.returnValue(new Error('testing error path'))
          checkFormMock.id = 1
          const result = await service.markAsDeleted(checkFormMock)
          expect(result).toBeTruthy()
          expect(checkFormDataService.sqlMarkFormAsDeleted).toHaveBeenCalled()
          expect(checkWindowDataService.sqlFindCheckWindowsAssignedToForms).toHaveBeenCalled()
        } catch (error) {
          expect(error.message).toBe('testing error path')
        }
        done()
      })
    })
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

  describe('#mergedFormIds', () => {
    it('should merge two arrays and return one', () => {
      const arr1 = [ 1, 2, 3, 4 ]
      const arr2 = [ 5, 6 ]
      const expected = [ 1, 2, 3, 4, 5, 6 ]
      const result = service.mergedFormIds(arr1, arr2)
      expect(result.toString).toBe(expected.toString)
      expect(result).toBeTruthy()
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
})
