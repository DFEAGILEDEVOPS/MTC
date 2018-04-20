'use strict'
/* global beforeEach, describe, it, expect, jasmine */

const moment = require('moment')
const jwt = require('jsonwebtoken')
const proxyquire = require('proxyquire')

let jwtService
let pupilDataServiceUpdateSpy

describe('JWT service', () => {
  let pupil
  let checkWindowEndDate

  beforeEach(() => {
    pupil = {
      id: 1,
      token: undefined,
      // required pupil fields
      dob: moment(),
      gender: 'M',
      school: 9991999,
      lastName: 'Test',
      foreName: 'TestForename'
    }
    checkWindowEndDate = moment().add(1, 'day').toDate()
  })

  describe('#createToken', () => {
    beforeEach(() => {
      pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
      jwtService = proxyquire('../../services/jwt.service', {
        './data-access/pupil.data.service': {
          sqlUpdate: pupilDataServiceUpdateSpy
        }
      })
    })

    it('creates a token', async (done) => {
      const token = await jwtService.createToken(pupil, checkWindowEndDate)
      expect(token.token).toBeTruthy()
      expect(token.token.split('.').length).toBe(3)
      done()
    })

    it('the token details look correct', async (done) => {
      const token = await jwtService.createToken(pupil, checkWindowEndDate)
      const decoded = jwt.verify(token.token, token.jwtSecret)
      expect(decoded).toBeTruthy()
      const expiry = Math.abs(decoded.exp - Math.round(Date.now() / 1000))
      expect(expiry).toBeGreaterThan(0) // expect the expiry date to be greater than 0
      expect(decoded.sub).toBeTruthy()
      expect(decoded.sub).toBe(1)
      done()
    })

    it('throws an error when the pupil object is missing', async (done) => {
      try {
        await jwtService.createToken()
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Pupil is required')
        done()
      }
    })

    it('throws an error when the check window end date is missing', async (done) => {
      try {
        await jwtService.createToken(pupil)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Check window end date is required')
        done()
      }
    })

    it('saves a new secret on the pupil', async (done) => {
      const token = await jwtService.createToken(pupil, checkWindowEndDate)
      expect(token).toBeTruthy()
      expect(pupilDataServiceUpdateSpy).toHaveBeenCalled()
      expect(token.jwtSecret).toBeTruthy()
      expect(token.jwtSecret.length).toBe(64)
      done()
    })
  })
})
