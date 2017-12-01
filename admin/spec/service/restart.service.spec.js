const sinon = require('sinon')
const moment = require('moment')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const restartService = require('../../services/restart.service')
const pinValidator = require('../../lib/validator/pin-validator')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach, spyOn xit */

describe('restart.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('getPupils', () => {
    it('it should throw an error if school is not found', async () => {
      spyOn(schoolDataService, 'findOne').and.returnValue(null)
      try {
        await restartService.getPupils(schoolMock._id)
      } catch (error) {
        expect(error.message).toBe('School [9991001] not found')
      }
    })
    it('it should return a list of pupils', async () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      spyOn(schoolDataService, 'findOne').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'getSortedPupils').and.returnValue([pupil1, pupil2])
      spyOn(restartService, 'isPupilEligible').and.returnValue(true)
      let result
      try {
        result = await restartService.getPupils(schoolMock._id)
      } catch (error) {
        expect(error).toBeUndefined()
      }
      expect(result.length).toBe(2)
    })
  })

  describe('isPupilEligible', () => {
    xit('it should return false if pupil has been restarted exactly 2 times', () => {
      const pupil = Object.assign({}, pupilMock)
      // pupil.restartCount = 2
      const result = restartService.isPupilEligible(pupil)
      expect(result).toBeFalsy()
    })
    it('it should return false if pupil has an attendance code', () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.attendanceCode = { code: 2 }
      const result = restartService.isPupilEligible(pupil)
      expect(result).toBeFalsy()
    })
    it('it should return true if pupil does not have an active pin', () => {
      const pupil = Object.assign({}, pupilMock)
      pupil.pinExpiresAt = moment.utc()
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const result = restartService.isPupilEligible(pupil)
      expect(result).toBeTruthy()
    })
  })
})
