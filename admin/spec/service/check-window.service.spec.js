'use strict'
/* global describe expect it beforeEach */

const proxyquire = require('proxyquire').noCallThru()
const checkWindowMock = require('../mocks/check-window')
const checkWindowsMock = require('../mocks/check-windows')
const checkWindowsService = require('../../services/check-window.service')

describe('check-window.service', () => {
  let service = require('../../services/check-window.service')

  function setupService () {
    return proxyquire('../../services/check-window.service', {
      '../../services/check-window.service': checkWindowsService
    })
  }

  describe('formatCheckWindowDocuments', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(checkWindowMock) })
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
    xit('should return check windows assigned to passed form', () => {
      console.log('To be done after refactoring the service method')
    })
  })

  describe('markAsDeleted', () => {
    xit('should mark form as soft deleted if no check window was assigned or has not started', () => {
      console.log('To be done after refactoring the service method')
    })
  })
})
