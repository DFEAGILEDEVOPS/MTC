'use strict'
/* global describe expect it beforeEach afterEach fail xdescribe xit spyOn */

const checkFormMock = require('../mocks/check-form')
const checkWindowsMock = require('../mocks/check-windows')

describe('check-window.service', () => {
  let service, checkWindowDataService, checkFormDataService
  beforeEach(() => {
    service = require('../../services/check-window.service')
    checkWindowDataService = require('../../services/data-access/check-window.data.service')
    checkFormDataService = require('../../services/data-access/check-form.data.service')
  })

  describe('formatCheckWindowDocuments', () => {
    it('should return data correctly formatted (1)', () => {
      const isCurrent = true
      const canRemove = false
      const result = service.formatCheckWindowDocuments(checkWindowsMock, isCurrent, canRemove)

      expect(result[0].checkWindowName).toBe('Test window 3')
      expect(result[0].adminStartDate).toBe('18 Oct 2017')
      expect(result[0].checkDates).toBe('10 Jan to 20 Jan 2018')
      expect(result[0].isCurrent).toBe(isCurrent)
      expect(result[0].canRemove).toBe(canRemove)
    })

    it('should return data correctly formatted (2)', () => {
      const isCurrent = false
      const canRemove = false
      const result = service.formatCheckWindowDocuments(checkWindowsMock, isCurrent, canRemove)

      expect(result[1].checkWindowName).toBe('Window Test 1')
      expect(result[1].adminStartDate).toBe('19 Oct 2017')
      expect(result[1].checkDates).toBe('25 Oct to 28 Nov 2017')
      expect(result[1].isCurrent).toBe(isCurrent)
      expect(result[1].canRemove).toBe(canRemove)
    })
  })

  describe('markAsDeleted - happy path', () => {
    it('should mark a form as soft deleted if no check window was assigned or was assigned but have not started', async (done) => {
      spyOn(checkWindowDataService, 'sqlFindCheckWindowsAssignedToForms').and.returnValue([])
      spyOn(checkFormDataService, 'sqlDeleteForm').and.returnValue(Promise.resolve())
      await service.markAsDeleted(checkFormMock)
      expect(checkFormDataService.sqlDeleteForm).toHaveBeenCalledWith(checkFormMock.id)
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
          spyOn(checkFormDataService, 'sqlDeleteForm').and.returnValue(new Error('testing error path'))
          checkFormMock.id = 1
          const result = await service.markAsDeleted(checkFormMock)
          expect(result).toBeTruthy()
          expect(checkFormDataService.sqlDeleteForm).toHaveBeenCalled()
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
  })
})
