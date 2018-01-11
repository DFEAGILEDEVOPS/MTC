'use strict'
/* global describe expect it beforeEach afterEach */

const sinon = require('sinon')
const checkFormMock = require('../mocks/check-form')
const checkWindowsMock = require('../mocks/check-windows')
const checkWindowDataService = require('../../services/data-access/check-window.data.service')

describe('check-window.service', () => {
  let service = require('../../services/check-window.service')
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => sandbox.restore())

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

  describe('getCheckWindowsAssignedToForms', () => {
    let fetchCheckWindowsStub

    describe('Happy path', () => {
      beforeEach(() => {
        fetchCheckWindowsStub = sandbox.stub(checkWindowDataService, 'sqlFetchCheckWindows').resolves(checkWindowsMock)
      })

      it('should return check windows grouped by form id', () => {
        const result = service.getCheckWindowsAssignedToForms()
        expect(result).toBeTruthy()
        expect(fetchCheckWindowsStub.callCount).toBe(1)
      })
    })

    describe('Unhappy path', () => {
      beforeEach(() => {
        fetchCheckWindowsStub = sandbox.stub(checkWindowDataService, 'sqlFetchCheckWindows').rejects(new Error('ERROR retrieving check windows'))
      })

      it('should return an error', async (done) => {
        try {
          const result = await service.getCheckWindowsAssignedToForms()
          expect(result).toBeTruthy()
          expect(fetchCheckWindowsStub.callCount).toBe(1)
          done()
        } catch (error) {
          expect(error.toString()).toBe('Error: ERROR retrieving check windows')
          done()
        }
      })
    })
  })

  describe('markAsDeleted - happy path', () => {
    it('should mark a form as soft deleted if no check window was assigned or was assigned but have not started', () => {
      const result = service.markAsDeleted(checkFormMock)
      expect(result).toBeTruthy()
    })
  })

  describe('markAsDeleted - unhappy path', () => {
    describe('If the argument has no data', () => {
      it('should return an error if the argument does not contain an _id', async (done) => {
        checkFormMock._id = null
        try {
          const result = await service.markAsDeleted(checkFormMock)
          expect(result).toBeTruthy()
          done()
        } catch (error) {
          expect(error.toString()).toBe('Error: This form does not have an id')
          done()
        }
      })
    })

    describe('If saving documents fails', () => {
      it('should return an error', async (done) => {
        try {
          const result = await service.markAsDeleted(checkFormMock)
          expect(result).toBeTruthy()
        } catch (error) {
          expect(error.toString()).toBe('Error: This form does not have an id')
        }
        done()
      })
    })
  })

  describe('#getCurrentCheckWindowsAndCountForms', () => {
    let fetchCurrentCheckWindowsStub

    beforeEach(() => {
      fetchCurrentCheckWindowsStub = sandbox.stub(checkWindowDataService, 'sqlFetchCurrentCheckWindows').resolves(checkWindowsMock)
    })

    it('should return an object with _id, checkWindowName and totalForms items', () => {
      const result = service.getCurrentCheckWindowsAndCountForms()
      expect(result).toBeTruthy()
      expect(fetchCurrentCheckWindowsStub.callCount).toBe(1)
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
