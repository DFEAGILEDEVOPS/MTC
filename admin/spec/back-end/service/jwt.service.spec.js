'use strict'
/* global beforeEach describe test expect jest afterEach */

const moment = require('moment')
const jwt = require('jsonwebtoken')
const pupilDataService = require('../../../services/data-access/pupil.data.service')

let jwtService
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
    jwtService = require('../../../services/jwt.service')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#createToken', () => {
    test('creates a token', async () => {
      const token = await jwtService.createToken(pupil, expiryDate)
      expect(token.token).toBeTruthy()
      expect(token.token.split('.').length).toBe(3)
    })

    test('the token details look correct', async () => {
      const token = await jwtService.createToken(pupil, expiryDate)
      const decoded = jwt.verify(token.token, token.jwtSecret)
      expect(decoded).toBeTruthy()
      const expiry = Math.abs(decoded.exp - Math.round(Date.now() / 1000))
      expect(expiry).toBeGreaterThan(0) // expect the expiry date to be greater than 0
      expect(decoded.sub).toBeTruthy()
      expect(decoded.sub).toBe(1)
    })

    test('throws an error when the pupil object is missing', async () => {
      await expect(jwtService.createToken()).rejects.toThrow('Pupil is required')
    })

    test('throws an error when the expiry date is missing', async () => {
      await expect(jwtService.createToken(pupil)).rejects.toThrow('Expiry date is required')
    })

    test('throws an error when the expiry date is not a moment object', async () => {
      await expect(jwtService.createToken(pupil, new Date())).rejects.toThrow('Invalid expiry date')
    })
  })

  describe('verifying a token', () => {
    describe('and the pupil is found', () => {
      beforeEach(() => {
        pupilDataService.sqlUpdate = jest.fn(() => Promise.resolve())
        pupilDataService.sqlFindOneById = jest.fn(() => Promise.resolve(pupil))
      })

      test('throws when not provided a token', async () => {
        await expect(jwtService.verify()).rejects.toThrow('Token is required')
      })

      test('then it is able to decode a valid token', async () => {
        const token = await jwtService.createToken(pupil, expiryDate)
        pupil.jwtSecret = token.jwtSecret
        await expect(jwtService.verify(token.token)).resolves.toBe(true)
      })
    })

    describe('and the pupil is NOT found', () => {
      beforeEach(() => {
        pupilDataService.sqlUpdate = jest.fn(() => Promise.resolve())
        pupilDataService.sqlFindOneById = jest.fn(() => Promise.resolve(null))
      })
      test('then it throws an error', async () => {
        const token = await jwtService.createToken(pupil, expiryDate)
        await expect(jwtService.verify(token.token)).rejects.toThrow('Subject not found')
      })
    })

    describe('and the pupil has had the key revoked', () => {
      beforeEach(() => {
        pupilDataService.sqlUpdate = jest.fn(() => Promise.resolve())
        pupilDataService.sqlFindOneById = jest.fn(() => Promise.resolve(pupil))
      })
      test('then it throws an error', async () => {
        const result = await jwtService.createToken(pupil, expiryDate)
        pupil.jwtSecret = undefined
        // Note we pass in pupil, and this object gets the secret saved in it
        // But we aren't able to mimic the the key not being found on the object
        // (as it is not a required property) so we get the sandbox to returned a cloned object that
        // definitely does not have a valid `jwtSecret` property.
        await expect(jwtService.verify(result.token)).rejects.toThrow('Error - missing secret')
      })
    })
    describe('and the pupil has an incorrect jwtSecret', () => {
      beforeEach(() => {
        pupilDataService.sqlUpdate = jest.fn(() => Promise.resolve())
        pupilDataService.sqlFindOneById = jest.fn(() => Promise.resolve(pupil))
      })
      test('then it throws an error', async () => {
        const token = await jwtService.createToken(pupil, expiryDate)
        pupil.jwtSecret = 'incorrect secret'
        await expect(jwtService.verify(token.token)).rejects.toThrow('Unable to verify: invalid signature')
      })
    })
  })

  describe('break-in tests', () => {
    beforeEach(() => {
      pupilDataService.sqlUpdate = jest.fn(() => Promise.resolve())
      pupilDataService.sqlFindOneById = jest.fn(() => Promise.resolve(pupil))
    })
    test('denies a token that has expired 1 hour ago', async () => {
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
      await expect(jwtService.verify(token)).rejects.toThrow('Unable to verify: jwt expired')
    })

    test('denies a token that has expired 1 second ago', async () => {
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
      await expect(jwtService.verify(token)).rejects.toThrow('Unable to verify: jwt expired')
    })

    test('denies a token that is not yet active, but has not yet expired', async () => {
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
      await expect(jwtService.verify(token)).rejects.toThrow('Unable to verify: jwt not active')
    })

    test('denies a token that is almost active, but has not yet expired', async () => {
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
      await expect(jwtService.verify(token)).rejects.toThrow('Unable to verify: jwt not active')
    })

    test('denies a token that not active, and has expired', async () => {
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
      await expect(jwtService.verify(token)).rejects.toThrow('Unable to verify: jwt not active')
    })

    test('denies a weird token', async () => {
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
      await expect(jwtService.verify(token)).rejects.toThrow('Unable to verify: jwt expired')
    })
  })
})
