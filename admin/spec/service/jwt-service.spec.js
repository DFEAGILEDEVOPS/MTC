'use strict'
const Pupil = require('../../models/pupil')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const jwtService = require('../../services/jwt-service')
const jwt = require('jsonwebtoken')

/* global beforeEach, describe, it, expect, spyOn */

describe('JWT service', () => {
  let pupil

  beforeEach(() => {
    pupil = new Pupil({
      _id: new mongoose.Types.ObjectId(),
      jwtSecret: undefined,
      // required pupil fields
      dob: new Date(),
      gender: 'M',
      school: 9991999,
      lastName: 'Test',
      foreName: 'TestForename'
    })

    spyOn(pupil, 'save').andCallFake(() => Promise.resolve(pupil))
  })

  describe('creating a token', () => {
    it('creates a token', async (done) => {
      const token = await jwtService.createToken(pupil)
      expect(token).toBeTruthy()
      expect(token.split('.').length).toBe(3)
      done()
    })
    it('the token details look correct', async (done) => {
      const token = await jwtService.createToken(pupil)
      const decoded = jwt.verify(token, pupil.jwtSecret)
      expect(decoded).toBeTruthy()
      const expiry = Math.abs(decoded.exp - Math.round(Date.now() / 1000))
      expect(expiry - 3600 <= 1).toBe(true) // expect the expiry date to be 3600 seconds +- 1 second
      expect(decoded.sub).toBeTruthy()
      expect(decoded.sub.length).toBe(24)
      done()
    })
    it('throws an error when the pupil object is missing', async (done) => {
      try {
        await jwtService.createToken()
        done(new Error('Expected call to throw and it didn\'t'))
      } catch (error) {
        expect(error.message).toBe('Pupil is required')
        done()
      }
    })
    it('saves a new secret on the pupil', async (done) => {
      const token = await jwtService.createToken(pupil)
      expect(token).toBeTruthy()
      expect(pupil.save).toHaveBeenCalled()
      expect(pupil.jwtSecret).toBeTruthy()
      expect(pupil.jwtSecret.length).toBe(64)
      done()
    })
  })
})
