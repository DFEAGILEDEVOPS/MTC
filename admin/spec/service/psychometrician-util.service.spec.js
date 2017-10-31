'use strict'
/* global describe it expect beforeEach */

const service = require('../../services/psychometrician-util.service')

// Get a marked check mock
const checkMockOrig = require('../mocks/check-with-results')

// and a completedCheck that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')
const pupilMockOrig = require('../mocks/pupil')
const schoolMockOrig = require('../mocks/school')

describe('psychometrician-util.service', () => {
  let completedCheckMock
  beforeEach(() => {
    completedCheckMock = Object.assign({ check: {} }, completedCheckMockOrig)
    const checkMock = Object.assign({}, checkMockOrig)
    const pupilMock = Object.assign({}, pupilMockOrig)
    const schoolMock = Object.assign({}, schoolMockOrig)
    completedCheckMock.check = checkMock
    pupilMock.school = schoolMock
    completedCheckMock.check.pupilId = pupilMock
  })

  describe('#getSurname', () => {
    it('retrieves a surname', () => {
      expect(service.getSurname(completedCheckMock)).toBe('One')
    })

    it('truncates to 35 chars long', () => {
      completedCheckMock.check.pupilId.lastName = 's'.repeat(40)
      expect(service.getSurname(completedCheckMock).length).toBe(35)
    })
  })

  describe('#getForename', () => {
    it('retrieves a forename', () => {
      expect(service.getForename(completedCheckMock)).toBe('Pupil')
    })

    it('truncates to 35 chars long', () => {
      completedCheckMock.check.pupilId.foreName = 'f'.repeat(40)
      expect(service.getForename(completedCheckMock).length).toBe(35)
    })
  })

  describe('#getMiddleNames', () => {
    it('retrieves all the middlenames', () => {
      completedCheckMock.check.pupilId.middleNames = 'Peter John Luke'
      expect(service.getMiddleNames(completedCheckMock)).toBe('Peter John Luke')
    })

    it('truncates to 35 chars long', () => {
      completedCheckMock.check.pupilId.middleNames = 'm'.repeat(40)
      expect(service.getMiddleNames(completedCheckMock).length).toBe(35)
    })

    it('handles empty middlenames', () => {
      completedCheckMock.check.pupilId.middleNames = undefined
      expect(service.getMiddleNames(completedCheckMock)).toBe('')
    })
  })

  describe('#getMark', () => {
    it('returns the number of mark applied to the check', () => {
      completedCheckMock.check.results.marks = 42
      expect(service.getMark(completedCheckMock)).toBe(42)
    })

    it('returns "error" if the check has not been marked', () => {
      delete completedCheckMock.check.results
      expect(service.getMark(completedCheckMock)).toBe('error')
    })
  })

  describe('#getSchoolURN', () => {
    it('returns the school URN when it exists', () => {
      completedCheckMock.check.pupilId.school.urn = 'SCH999'
      expect(service.getSchoolURN(completedCheckMock)).toBe('SCH999')
    })

    it('returns "error" if the check has not been marked', () => {
      delete completedCheckMock.check.results
      expect(service.getMark(completedCheckMock)).toBe('error')
    })

    it('returns "n/a" if the school URN is not present', () => {
      completedCheckMock.check.pupilId.school.urn = undefined
      expect(service.getSchoolURN(completedCheckMock)).toBe('n/a')
    })
  })
})
