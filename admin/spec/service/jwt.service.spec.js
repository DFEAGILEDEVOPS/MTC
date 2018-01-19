'use strict'
/* global beforeEach, describe, it, expect, jasmine */

const moment = require('moment')
const jwt = require('jsonwebtoken')
const proxyquire = require('proxyquire')

let jwtService
let pupilDataServiceUpdateSpy
const pupilId = 123

describe('JWT service', () => {
  let pupil

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
      const token = await jwtService.createToken(pupil)
      expect(token.token).toBeTruthy()
      expect(token.token.split('.').length).toBe(3)
      done()
    })

    it('the token details look correct', async (done) => {
      const token = await jwtService.createToken(pupil)
      const decoded = jwt.verify(token.token, token.jwtSecret)
      expect(decoded).toBeTruthy()
      const expiry = Math.abs(decoded.exp - Math.round(Date.now() / 1000))
      expect(expiry - 3600 <= 1).toBe(true) // expect the expiry date to be 3600 seconds +- 1 second
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

    it('saves a new secret on the pupil', async (done) => {
      const token = await jwtService.createToken(pupil)
      expect(token).toBeTruthy()
      expect(pupilDataServiceUpdateSpy).toHaveBeenCalled()
      expect(token.jwtSecret).toBeTruthy()
      expect(token.jwtSecret.length).toBe(64)
      done()
    })
  })

  describe('verifying a token', () => {
    it('throws an error if the token is not provided', async (done) => {
      try {
        await jwtService.verify()
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Token is required')
        done()
      }
    })

    describe('and the pupil is found', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () { return Promise.resolve(pupil) })
        jwtService = proxyquire('../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })

      it('then it is able to decode a valid token', async (done) => {
        const token = await jwtService.createToken(pupil)
        try {
          pupil.token = token.jwtSecret
          const isVerified = await jwtService.verify(token.token)
          expect(isVerified).toBe(true)
        } catch (error) {
          expect(error).toBeFalsy()
        }
        done()
      })
    })

    describe('and the pupil is NOT found', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve()
        })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve(null)
        })
        jwtService = proxyquire('../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })
      it('then it throws an error', async (done) => {
        const token = await jwtService.createToken(pupil)
        try {
          await jwtService.verify(token.token)
          expect('this').toBe('thrown')
        } catch (error) {
          expect(error.message).toBe('Subject not found')
          done()
        }
      })
    })

    describe('and the pupil has had the key revoked', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupil.token = undefined
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve()
        })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve(pupil)
        })
        jwtService = proxyquire('../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })
      it('then it throws an error', async (done) => {
        const token = await jwtService.createToken(pupil)
        // Note we pass in pupil, and this object gets the secret saved in it
        // But we wasn't to mimic the the key not being found on the object
        // (as it is not a required property) so we get the sandbox to returned a cloned object that
        // definitely does not have a valid `jztSecret` property.
        try {
          await jwtService.verify(token.token)
          expect('this').toBe('thrown')
        } catch (error) {
          expect(error.message).toBe('Error - missing secret')
          done()
        }
      })
    })
    describe('and the pupil has an incorrect jwtSecret', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupil.token = 'incorrect secret'
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve()
        })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve(pupil)
        })
        jwtService = proxyquire('../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })
      it('then it throws an error', async (done) => {
        const token = await jwtService.createToken(pupil)
        try {
          await jwtService.verify(token.token)
          expect('this').toBe('thrown')
        } catch (error) {
          expect(error.message).toBe('Unable to verify: invalid signature')
          done()
        }
      })
    })
  })

  describe('break-in tests', () => {
    let pupilDataServiceFindOneSpy

    beforeEach(() => {
      pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () {
        return Promise.resolve()
      })
      pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () {
        return Promise.resolve(pupil)
      })
      jwtService = proxyquire('../../services/jwt.service', {
        './data-access/pupil.data.service': {
          sqlUpdate: pupilDataServiceUpdateSpy,
          sqlFindOneById: pupilDataServiceFindOneSpy
        }
      })
    })
    it('denies a token that has expired 1 hour ago', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: pupilId,                                    // Subject
        exp: Math.floor(Date.now() / 1000) - (60 * 60),         // Expires an hour ago
        nbf: Math.floor(Date.now() / 1000) - 60 * 60 * 2        // Not before
      }
      pupil.token = 'testing123'
      const token = jwt.sign(payload, pupil.token)
      // Test
      try {
        await jwtService.verify(token)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
      done()
    })

    it('denies a token that has expired 1 second ago', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: pupilId,                                    // Subject
        exp: Math.floor(Date.now() / 1000) - 1,                 // Expires 1s ago
        nbf: Math.floor(Date.now() / 1000) - 60 * 60 * 2        // Not before
      }
      pupil.token = 'testing123'
      const token = jwt.sign(payload, pupil.token)
      // Test
      try {
        await jwtService.verify(token)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
      done()
    })

    it('denies a token that is not yet active, but has not yet expired', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: pupilId,                                    // Subject
        exp: Math.floor(Date.now() / 1000) + 120,               // Expires in 120s
        nbf: Math.floor(Date.now() / 1000) + 60                 // Not before: becomes active in 60s
      }
      pupil.token = 'testing123'
      const token = jwt.sign(payload, pupil.token)
      // Test
      try {
        await jwtService.verify(token)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
      done()
    })

    it('denies a token that is almost active, but has not yet expired', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: pupilId,                                    // Subject
        exp: Math.floor(Date.now() / 1000) + 120,               // Expires in 120s
        nbf: Math.floor(Date.now() / 1000) + 1                  // Not before: becomes active in 1s
      }
      pupil.token = 'testing123'
      const token = jwt.sign(payload, pupil.token)
      // Test
      try {
        await jwtService.verify(token)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
      done()
    })

    it('denies a token that not active, and has expired', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: pupilId,                                    // Subject
        exp: Math.floor(Date.now() / 1000) - 1,                 // Expired 1s ago
        nbf: Math.floor(Date.now() / 1000) + 1                  // Not before: becomes active in 1s
      }
      pupil.token = 'testing123'
      const token = jwt.sign(payload, pupil.token)
      // Test
      try {
        await jwtService.verify(token)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
      done()
    })

    it('denies a weird token', async (done) => {
      // Setup
      const payload = {
        iss: 'MTC Admin',                                       // Issuer
        sub: pupilId,                                    // Subject
        exp: Math.floor(Date.now() / 1000),                     // Expired now
        nbf: Math.floor(Date.now() / 1000)                      // Not before: becomes active mow
      }
      pupil.token = 'testing123'
      const token = jwt.sign(payload, pupil.token)
      // Test
      try {
        await jwtService.verify(token)
        expect('this').toBe('thrown')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
      done()
    })
  })
})
