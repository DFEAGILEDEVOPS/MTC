'use strict'
/* global describe expect it beforeEach fail spyOn */

const checkFormMock = require('../mocks/check-form')
const checkWindowsMock = require('../mocks/check-windows')
const moment = require('moment')

describe('check-window.service', () => {
  let service, checkWindowDataService, checkFormDataService
  beforeEach(() => {
    service = require('../../services/check-window.service')
    checkWindowDataService = require('../../services/data-access/check-window.data.service')
    checkFormDataService = require('../../services/data-access/check-form.data.service')
  })

  describe('formatCheckWindowDocuments', () => {
    it('should return dates correctly formatted', () => {
      const isCurrent = true
      const canRemove = false
      const checkWindows = [
        {
          id: 1,
          checkEndDate: moment('2018-01-20 00:00:00'),
          checkStartDate: moment('2018-01-10 00:00:00'),
          adminStartDate: moment('2017-10-18 00:00:00'),
          name: 'Test window 3',
          formCount: 2,
          isDeleted: false
        }
      ]
      const result = service.formatCheckWindowDocuments(checkWindows, isCurrent, canRemove)

      expect(result[0].checkWindowName).toBe('Test window 3')
      expect(result[0].adminStartDate).toBe('18 Oct 2017')
      expect(result[0].checkDates).toBe('10 Jan to 20 Jan 2018')
    })

    it('should respect passed in value of canRemove when false', () => {
      const isCurrent = false
      const canRemove = false
      const checkWindows = [
        {
          id: 1,
          checkEndDate: moment('2018-01-20 00:00:00'),
          checkStartDate: moment('2018-01-10 00:00:00'),
          adminStartDate: moment('2017-10-18 00:00:00'),
          name: 'Test window 3',
          formCount: 2,
          isDeleted: false
        }
      ]
      const result = service.formatCheckWindowDocuments(checkWindows, isCurrent, canRemove)
      expect(result[0].canRemove).toBe(canRemove)
    })

    it('should respect passed in value of canRemove when true', () => {
      const isCurrent = false
      const canRemove = true
      const checkWindows = [
        {
          id: 1,
          checkEndDate: moment('2018-01-20 00:00:00'),
          checkStartDate: moment('2018-01-10 00:00:00'),
          adminStartDate: moment('2017-10-18 00:00:00'),
          name: 'Test window 3',
          formCount: 2,
          isDeleted: false
        }
      ]
      const result = service.formatCheckWindowDocuments(checkWindows, isCurrent, canRemove)
      expect(result[0].canRemove).toBe(canRemove)
    })

    it('should set canRemove to true when checkStartDate is greater than today', () => {
      const isCurrent = false
      const checkWindows = [
        {
          id: 1,
          checkEndDate: moment().add(7, 'days'),
          checkStartDate: moment().add(2, 'days'),
          adminStartDate: moment().subtract(5, 'days'),
          name: 'Future Test Window',
          formCount: 2,
          isDeleted: false
        }
      ]
      const result = service.formatCheckWindowDocuments(checkWindows, isCurrent)
      expect(result[0].canRemove).toBe(true)
    })

    it('should set canRemove to true when checkStartDate is today', () => {
      const dateService = require('../../services/date.service')
      const today = moment('2017-09-01')
      spyOn(dateService, 'utcNowAsMoment').and.returnValue(today)
      const isCurrent = false
      const checkWindows = [
        {
          id: 1,
          checkEndDate: today.add(7, 'days'),
          checkStartDate: today,
          adminStartDate: today.subtract(5, 'days'),
          name: 'Future Test Window',
          formCount: 2,
          isDeleted: false
        }
      ]
      const result = service.formatCheckWindowDocuments(checkWindows, isCurrent)
      expect(result[0].canRemove).toBe(true)
    })

    it('should set canRemove to false when checkStartDate is before today', () => {
      const isCurrent = false
      const checkWindows = [
        {
          id: 1,
          checkEndDate: moment().add(7, 'days'),
          checkStartDate: moment().subtract(2, 'days'),
          adminStartDate: moment().subtract(5, 'days'),
          name: 'Future Test Window',
          formCount: 2,
          isDeleted: false
        }
      ]
      const result = service.formatCheckWindowDocuments(checkWindows, isCurrent)
      expect(result[0].canRemove).toBe(false)
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
      spyOn(checkWindowDataService, 'sqlFindCurrent').and.returnValue(checkWindowsMock)
      const result = await service.getCurrentCheckWindowsAndCountForms()
      expect(result).toBeTruthy()
      expect(result.length).toBe(3)
      expect(checkWindowDataService.sqlFindCurrent).toHaveBeenCalledTimes(1)
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
    describe('#isLoginAllowed', () => {
      it('should allow pupil to login if within range', async (done) => {
        spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue({
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(1, 'days')
        })
        try {
          await service.isLoginAllowed()
        } catch (error) {
          fail('not expected to throw')
        }
        done()
      })
      it('should disallow pupil to login if checkStartDate is in the future', async (done) => {
        spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue({
          checkStartDate: moment.utc().add(1, 'days'),
          checkEndDate: moment.utc().add(2, 'days')
        })
        try {
          await service.isLoginAllowed()
          fail('not expected to throw')
        } catch (error) {
          expect(error.message).toBe('Pupil not allowed to log in')
        }
        done()
      })
      it('should disallow pupil to login if checkEndDate is in the past', async (done) => {
        spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue({
          checkStartDate: moment.utc().subtract(3, 'days'),
          checkEndDate: moment.utc().subtract(2, 'days')
        })
        try {
          await service.isLoginAllowed()
          fail('not expected to throw')
        } catch (error) {
          expect(error.message).toBe('Pupil not allowed to log in')
        }
        done()
      })
    })
  })
})
