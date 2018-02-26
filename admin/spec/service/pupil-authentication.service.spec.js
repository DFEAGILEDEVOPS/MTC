'use strict'
/* global describe beforeEach afterEach it expect */

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const schoolDataService = require('../../services/data-access/school.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pinValidator = require('../../lib/validator/pin-validator')
const schoolMock = require('../mocks/school')
const pupilMockOrig = require('../mocks/pupil')
const pupilMock = {}
// Prevent node require caching the school under the pupil mock
Object.assign(pupilMock, pupilMockOrig)
pupilMock.school = schoolMock

describe('pupil authentication service', () => {
  let service, sandbox

  function setupService (schoolMock, pupilMock) {
    return proxyquire('../../services/pupil-authentication.service', {
      '../services/data-access/school.data.service': sandbox.mock(schoolDataService)
        .expects('sqlFindOneBySchoolPin')
        .resolves(schoolMock),
      '../models/pupil': sandbox.mock(pupilDataService)
        .expects('sqlFindOneByPinAndSchool')
        .resolves(pupilMock)
    })
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('happy path', () => {
    beforeEach(() => {
      service = setupService(schoolMock, pupilMock)
      sandbox.mock(pinValidator).expects('isActivePin').resolves(true)
      proxyquire('../../services/pin-generation.service', {
        '../../services/pin-generation.service': pinValidator
      })
    })

    it('authenticates a pupil', async (done) => {
      const data = await service.authenticate('pupilPin', 'schoolPin')
      expect(data).toEqual({ pupil: pupilMock, school: schoolMock })
      done()
    })

    it('prepares the pupil data', () => {
      const pupilData = service.getPupilDataForSpa(pupilMock)
      expect(pupilData.firstName).toBe(pupilMock.foreName)
      expect(pupilData.lastName).toBe(pupilMock.lastName)
      expect(pupilData.dob).toBe('31 December 2000')
    })
  })

  describe('school not found', () => {
    beforeEach(() => {
      service = setupService(null, pupilMock)
    })

    it('throws when the school is not found', async (done) => {
      try {
        await service.authenticate('pupilPin', 'badPin')
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })

  describe('pupil not found', () => {
    beforeEach(() => {
      service = setupService(schoolMock, null)
    })

    it('throws when pupil is not found', async (done) => {
      try {
        await service.authenticate('badPin', 'schoolPin')
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })

  describe('pupil and school not found', () => {
    beforeEach(() => {
      service = setupService(null, null)
    })

    it('throws when both pupil and school are not found', async (done) => {
      try {
        await service.authenticate('badPin', 'badPin')
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })
})
