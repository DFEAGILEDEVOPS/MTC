'use strict'
/* global describe expect it beforeEach afterEach */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')
const CheckForm = require('../../models/check-form')
const checkFormMock = require('../mocks/check-form')
const checkWindowMock = require('../mocks/check-window')
const checkWindowsMock = require('../mocks/check-windows')
const checkWindowsByFormMock = require('../mocks/check-window-by-form')
const checkWindowService = require('../../services/check-window.service')
const checkWindowDataService = require('../../services/data-access/check-window.data.service')

describe('check-window.service', () => {
  let service = require('../../services/check-window.service')
  let sandbox

  function setupService () {
    return proxyquire('../../services/check-window.service', {
      '../../services/check-window.service': checkWindowService,
      '../../services/data-access/check-window.data.service': checkWindowDataService,
      '../../models/check-form': CheckForm
    })
  }

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => sandbox.restore())

  describe('formatCheckWindowDocuments', () => {
    beforeEach(() => {
      // TODO once all tests sorted, move this to top of file and remove proxyquire
      service = require('../../services/check-window.service')
    })

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
        service = setupService() // setupService(function () { return Promise.resolve(checkWindowsByFormMock) })
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
        service = setupService() // setupService(function () { return Promise.resolve(checkWindowsByFormMock) })
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
    beforeEach(() => {
      service = setupService() // setupService(function () { return Promise.resolve(checkWindowMock) })
    })

    it('should mark a form as soft deleted if no check window was assigned or was assigned but have not started', () => {
      const result = service.markAsDeleted(checkFormMock)
      expect(result).toBeTruthy()
    })
  })

  describe('markAsDeleted - unhappy path', () => {
    describe('If the argument has no data', () => {
      beforeEach(() => {
        service = setupService()
      })

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
      beforeEach(() => {
        service = setupService() // setupService(function () { return Promise.reject(new Error('ERROR SAVING')) })
      })

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
      service = setupService()
    })

    it('should return an object with _id, checkWindowName and totalForms items', () => {
      const result = service.getCurrentCheckWindowsAndCountForms()
      expect(result).toBeTruthy()
      expect(fetchCurrentCheckWindowsStub.callCount).toBe(1)
    })
  })

  describe('#mergedFormIds', () => {
    beforeEach(() => {
      service = setupService() // setupService(function () { return Promise.resolve(checkWindowMock) })
    })

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
