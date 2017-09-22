'use strict'
const sinon = require('sinon')
require('sinon-mongoose')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const jwt = require('jsonwebtoken')
const proxyquire = require('proxyquire')
const ObjectId = require('mongoose').Types.ObjectId

const Pupil = require('../../models/pupil')

let jwtService
let sandbox

/* global beforeEach, afterEach, describe, it, expect, spyOn */

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
    sandbox = sinon.sandbox.create()
    spyOn(pupil, 'save').and.callFake(() => Promise.resolve(pupil))
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('creating a token', () => {
    beforeEach(() => {
      jwtService = require('../../services/jwt.service')
    })

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

  describe('verifying a token', () => {
    it('throws an error if the token is not provided', async (done) => {
      try {
        await jwtService.verify()
        done(new Error('did not expect to be called'))
      } catch (error) {
        expect(error.message).toBe('Token is required')
        done()
      }
    })

    describe('and the pupil is found', () => {
      beforeEach(() => {
        sandbox.mock(Pupil).expects('findOne').chain('lean').chain('exec').resolves(pupil)
        jwtService = proxyquire('../../services/jwt-service', {
          '../models/pupil': Pupil
        })
      })

      it('then it is able to decode a valid token', async (done) => {
        const token = await jwtService.createToken(pupil)
        try {
          const isVerified = await jwtService.verify(token)
          expect(isVerified).toBe(true)
          done()
        } catch (error) {
          done('Not expected to get here')
        }
      })
    })

    describe('and the pupil is NOT found', () => {
      beforeEach(() => {
        sandbox.mock(Pupil).expects('findOne').chain('lean').chain('exec').resolves(null)
        jwtService = proxyquire('../../services/jwt-service', {
          '../models/pupil': Pupil
        })
      })
      it('then it throws an error', async (done) => {
        const token = await jwtService.createToken(pupil)
        try {
          await jwtService.verify(token)
          done('Not expected to get here')
        } catch (error) {
          expect(error.message).toBe('Subject not found')
          done()
        }
      })
    })

    describe('and the pupil has had the key revoked', () => {
      beforeEach(() => {
        const newPupil = JSON.parse(JSON.stringify(pupil))
        newPupil.jwtSecret = undefined
        sandbox.mock(Pupil).expects('findOne').chain('lean').chain('exec').resolves(newPupil)
        jwtService = proxyquire('../../services/jwt-service', {
          '../models/pupil': Pupil
        })
      })
      it('then it throws an error', async (done) => {
        const token = await jwtService.createToken(pupil)
        // Note we pass in pupil, and this object gets the secret saved in it
        // But we wasn't to mimic the the key not being found on the object
        // (as it is not a required property) so we get the sandbox to returned a cloned object that
        // definitely does not have a valid `jztSecret` property.
        try {
          await jwtService.verify(token)
          done('Not expected to get here')
        } catch (error) {
          expect(error.message).toBe('Error - missing secret')
          done()
        }
      })
    })
    describe('and the pupil has an incorrect jwtSecret', () => {
      beforeEach(() => {
        const newPupil = JSON.parse(JSON.stringify(pupil))
        newPupil.jwtSecret = 'incorrect secret'
        sandbox.mock(Pupil).expects('findOne').chain('lean').chain('exec').resolves(newPupil)
        jwtService = proxyquire('../../services/jwt-service', {
          '../models/pupil': Pupil
        })
      })
      it('then it throws an error', async (done) => {
        const token = await jwtService.createToken(pupil)
        try {
          await jwtService.verify(token)
          done('Not expected to get here')
        } catch (error) {
          expect(error.message).toBe('Unable to verify: invalid signature')
          done()
        }
      })
    })
  })

  describe('break-in tests', () => {
    let newPupil

    beforeEach(() => {
      newPupil = JSON.parse(JSON.stringify(pupil))
      sandbox.mock(Pupil).expects('findOne').chain('lean').chain('exec').resolves(newPupil)
      jwtService = proxyquire('../../services/jwt-service', {
        '../models/pupil': Pupil
      })
    })
    it('denies a token that has expired 1 hour ago', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: new ObjectId(),                                    // Subject
        exp: Math.floor(Date.now() / 1000) - (60 * 60),         // Expires an hour ago
        nbf: Math.floor(Date.now() / 1000) - 60 * 60 * 2        // Not before
      }
      newPupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, newPupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        done('Not expected to get here')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
      done()
    })

    it('denies a token that has expired 1 second ago', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: new ObjectId(),                                    // Subject
        exp: Math.floor(Date.now() / 1000) - 1,                 // Expires 1s ago
        nbf: Math.floor(Date.now() / 1000) - 60 * 60 * 2        // Not before
      }
      newPupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, newPupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        done('Not expected to get here')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
      done()
    })

    it('denies a token that is not yet active, but has not yet expired', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: new ObjectId(),                                    // Subject
        exp: Math.floor(Date.now() / 1000) + 120,               // Expires in 120s
        nbf: Math.floor(Date.now() / 1000) + 60                 // Not before: becomes active in 60s
      }
      newPupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, newPupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        done('Not expected to get here')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
      done()
    })

    it('denies a token that is almost active, but has not yet expired', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: new ObjectId(),                                    // Subject
        exp: Math.floor(Date.now() / 1000) + 120,               // Expires in 120s
        nbf: Math.floor(Date.now() / 1000) + 1                  // Not before: becomes active in 1s
      }
      newPupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, newPupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        done('Not expected to get here')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
      done()
    })

    it('denies a token that not active, and has expired', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: new ObjectId(),                                    // Subject
        exp: Math.floor(Date.now() / 1000) - 1,                 // Expired 1s ago
        nbf: Math.floor(Date.now() / 1000) + 1                  // Not before: becomes active in 1s
      }
      newPupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, newPupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        done('Not expected to get here')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
      done()
    })

    it('denies a weird token', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: new ObjectId(),                                    // Subject
        exp: Math.floor(Date.now() / 1000),                     // Expired now
        nbf: Math.floor(Date.now() / 1000)                      // Not before: becomes active mow
      }
      newPupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, newPupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        done('Not expected to get here')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
      done()
    })
  })
})
