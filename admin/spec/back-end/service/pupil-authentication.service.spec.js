'use strict'
/* global describe beforeEach spyOn it expect fail */

const schoolDataService = require('../../../services/data-access/school.data.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pinValidator = require('../../../lib/validator/pin-validator')
const schoolMock = require('../mocks/school')
const pupilMockOrig = require('../mocks/pupil')
const pupilMock = {}
// Prevent node require caching the school under the pupil mock
Object.assign(pupilMock, pupilMockOrig)
pupilMock.school = schoolMock

describe('pupil authentication service', () => {
  let sut
  describe('happy path', () => {
    beforeEach(() => {
      sut = require('../../../services/pupil-authentication.service')
    })

    it('authenticates a pupil', async (done) => {
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(schoolDataService, 'sqlFindOneBySchoolPin').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'sqlFindOneByPinAndSchool').and.returnValue(pupilMock)
      const data = await sut.authenticate('pupilPin', 'schoolPin')
      expect(data).toEqual({ pupil: pupilMock, school: schoolMock })
      done()
    })

    it('prepares the pupil data', () => {
      const pupilData = sut.getPupilDataForSpa(pupilMock)
      expect(pupilData.firstName).toBe(pupilMock.foreName)
      expect(pupilData.lastName).toBe(pupilMock.lastName)
      expect(pupilData.dob).toBe('31 December 2000')
    })
  })

  describe('school not found', () => {
    beforeEach(() => {
      sut = require('../../../services/pupil-authentication.service')
    })

    it('throws when the school is not found', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneBySchoolPin').and.returnValue(undefined)
      try {
        await sut.authenticate('pupilPin', 'badPin')
        fail('expected error to be thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })

  describe('pupil not found', () => {
    beforeEach(() => {
      sut = require('../../../services/pupil-authentication.service')
    })

    it('throws when pupil is not found', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneBySchoolPin').and.returnValue(schoolMock)
      spyOn(pupilDataService, 'sqlFindOneByPinAndSchool').and.returnValue(undefined)
      try {
        await sut.authenticate('badPin', 'schoolPin')
        fail('expect method to throw error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })

  describe('pupil and school not found', () => {
    beforeEach(() => {
      sut = require('../../../services/pupil-authentication.service')
    })

    it('throws when both pupil and school are not found', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneBySchoolPin').and.returnValue(undefined)
      try {
        await sut.authenticate('badPin', 'badPin')
        fail('expect method to throw error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })
})
