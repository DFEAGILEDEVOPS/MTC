'use strict'
/* global describe beforeEach afterEach it expect */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire')
const School = require('../../models/school')
const Pupil = require('../../models/pupil')

const schoolMock = require('../mocks/school')
const pupilMock = require('../mocks/pupil')
pupilMock.school = schoolMock

describe('pupil authentication service', () => {
  let service, sandbox

  function setupService (schoolMock, pupilMock) {
    return proxyquire('../../services/pupil-authentication.service', {
      '../models/school': sandbox.mock(School)
        .expects('findOne')
        .chain('exec')
        .resolves(schoolMock),
      '../models/pupil': sandbox.mock(Pupil)
        .expects('findOne')
        .chain('populate')
        .chain('exec')
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
    })

    it('authenticates a pupil', async (done) => {
      const pupil = await service.authenticate('pupilPin', 'schoolPin')
      expect(pupil).toEqual(pupilMock)
      done()
    })

    it('prepares the pupil data', () => {
      const pupil = new Pupil(pupilMock)
      const pupilData = service.getPupilDataForSpa(pupil)
      expect(pupilData.firstName).toBe(pupil.foreName)
      expect(pupilData.lastName).toBe(pupil.lastName)
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
        done(new Error('expected to throw'))
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
        done(new Error('expected to throw'))
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
        done(new Error('expected to throw'))
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Authentication failure')
        done()
      }
    })
  })
})
