'use strict'
/* global beforeEach, describe, it, expect, jasmine, fail */

const moment = require('moment')
const jwt = require('jsonwebtoken')
const proxyquire = require('proxyquire')

let jwtService
let pupilDataServiceUpdateSpy
const pupilId = 123

describe('JWT service', () => {
  let pupil
  let expiryDate

  beforeEach(() => {
    pupil = {
      id: 1,
      jwtSecret: undefined,
      jwtToken: undefined,
      // required pupil fields
      dob: moment(),
      gender: 'M',
      school: 9991999,
      lastName: 'Test',
      foreName: 'TestForename'
    }
    expiryDate = moment().add(1, 'day')
  })

  describe('#createToken', () => {
    beforeEach(() => {
      jwtService = require('../../../services/jwt.service')
    })

    it('creates a token', async () => {
      const token = await jwtService.createToken(pupil, expiryDate)
      expect(token.token).toBeTruthy()
      expect(token.token.split('.').length).toBe(3)
    })

    it('the token details look correct', async () => {
      const token = await jwtService.createToken(pupil, expiryDate)
      const decoded = jwt.verify(token.token, token.jwtSecret)
      expect(decoded).toBeTruthy()
      const expiry = Math.abs(decoded.exp - Math.round(Date.now() / 1000))
      expect(expiry).toBeGreaterThan(0) // expect the expiry date to be greater than 0
      expect(decoded.sub).toBeTruthy()
      expect(decoded.sub).toBe(1)
    })

    it('throws an error when the pupil object is missing', async () => {
      try {
        await jwtService.createToken()
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Pupil is required')
      }
    })

    it('throws an error when the expiry date is missing', async () => {
      try {
        await jwtService.createToken(pupil)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Expiry date is required')
      }
    })

    it('throws an error when the expiry date is not a moment object', async () => {
      try {
        await jwtService.createToken(pupil, new Date())
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiry date')
      }
    })
  })

  describe('verifying a token', () => {
    describe('and the pupil is found', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () { return Promise.resolve(pupil) })
        jwtService = proxyquire('../../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })

      it('throws when not provided a token', async () => {
        try {
          await jwtService.verify()
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Token is required')
        }
      })

      it('then it is able to decode a valid token', async () => {
        const token = await jwtService.createToken(pupil, expiryDate)
        try {
          pupil.jwtSecret = token.jwtSecret
          const isVerified = await jwtService.verify(token.token)
          expect(isVerified).toBe(true)
        } catch (error) {
          fail(error)
        }
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
        jwtService = proxyquire('../../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })
      it('then it throws an error', async () => {
        const token = await jwtService.createToken(pupil, expiryDate)
        try {
          await jwtService.verify(token.token)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Subject not found')
        }
      })
    })

    describe('and the pupil has had the key revoked', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve()
        })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve(pupil)
        })
        jwtService = proxyquire('../../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })
      it('then it throws an error', async () => {
        const result = await jwtService.createToken(pupil, expiryDate)
        pupil.jwtSecret = undefined
        // Note we pass in pupil, and this object gets the secret saved in it
        // But we wasn't to mimic the the key not being found on the object
        // (as it is not a required property) so we get the sandbox to returned a cloned object that
        // definitely does not have a valid `jwtSecret` property.
        try {
          await jwtService.verify(result.token)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Error - missing secret')
        }
      })
    })
    describe('and the pupil has an incorrect jwtSecret', () => {
      let pupilDataServiceFindOneSpy
      beforeEach(() => {
        pupilDataServiceUpdateSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve()
        })
        pupilDataServiceFindOneSpy = jasmine.createSpy().and.callFake(function () {
          return Promise.resolve(pupil)
        })
        jwtService = proxyquire('../../../services/jwt.service', {
          './data-access/pupil.data.service': {
            sqlUpdate: pupilDataServiceUpdateSpy,
            sqlFindOneById: pupilDataServiceFindOneSpy
          }
        })
      })
      it('then it throws an error', async () => {
        const token = await jwtService.createToken(pupil, expiryDate)
        pupil.jwtSecret = 'incorrect secret'
        try {
          await jwtService.verify(token.token)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toBe('Unable to verify: invalid signature')
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
      jwtService = proxyquire('../../../services/jwt.service', {
        './data-access/pupil.data.service': {
          sqlUpdate: pupilDataServiceUpdateSpy,
          sqlFindOneById: pupilDataServiceFindOneSpy
        }
      })
    })
    it('denies a token that has expired 1 hour ago', async () => {
      // Setup
      const payload = {
        iss: 'MTC Admin', // Issuer
        sub: pupilId, // Subject
        exp: Math.floor(Date.now() / 1000) - (60 * 60), // Expires an hour ago
        nbf: Math.floor(Date.now() / 1000) - 60 * 60 * 2 // Not before
      }
      pupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, pupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
    })

    it('denies a token that has expired 1 second ago', async () => {
      // Setup
      const payload = {
        iss: 'MTC Admin', // Issuer
        sub: pupilId, // Subject
        exp: Math.floor(Date.now() / 1000) - 1, // Expires 1s ago
        nbf: Math.floor(Date.now() / 1000) - 60 * 60 * 2 // Not before
      }
      pupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, pupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
    })

    it('denies a token that is not yet active, but has not yet expired', async () => {
      // Setup
      const payload = {
        iss: 'MTC Admin', // Issuer
        sub: pupilId, // Subject
        exp: Math.floor(Date.now() / 1000) + 120, // Expires in 120s
        nbf: Math.floor(Date.now() / 1000) + 60 // Not before: becomes active in 60s
      }
      pupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, pupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
    })

    it('denies a token that is almost active, but has not yet expired', async () => {
      // Setup
      const payload = {
        iss: 'MTC Admin', // Issuer
        sub: pupilId, // Subject
        exp: Math.floor(Date.now() / 1000) + 120, // Expires in 120s
        nbf: Math.floor(Date.now() / 1000) + 1 // Not before: becomes active in 1s
      }
      pupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, pupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
    })

    it('denies a token that not active, and has expired', async () => {
      // Setup
      const payload = {
        iss: 'MTC Admin', // Issuer
        sub: pupilId, // Subject
        exp: Math.floor(Date.now() / 1000) - 1, // Expired 1s ago
        nbf: Math.floor(Date.now() / 1000) + 1 // Not before: becomes active in 1s
      }
      pupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, pupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt not active')
      }
    })

    it('denies a weird token', async () => {
      // Setup
      const payload = {
        iss: 'MTC Admin', // Issuer
        sub: pupilId, // Subject
        exp: Math.floor(Date.now() / 1000), // Expired now
        nbf: Math.floor(Date.now() / 1000) // Not before: becomes active mow
      }
      pupil.jwtSecret = 'testing123'
      const token = jwt.sign(payload, pupil.jwtSecret)
      // Test
      try {
        await jwtService.verify(token)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Unable to verify: jwt expired')
      }
    })
  })
})
