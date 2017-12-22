'use strict'

/* global beforeEach, afterEach, describe, it, expect */

const proxyquire = require('proxyquire')
const sinon = require('sinon')
const groupValidator = require('../../../lib/validator/group-validator')
const groupDataService = require('../../../services/data-access/group.data.service')
const groupErrorMessages = require('../../../lib/errors/group').group
const groupMock = require('../../mocks/group')

describe('groupValidation', function () {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('happy path', () => {
    beforeEach(() => {
      sandbox.mock(groupDataService).expects('fetchGroup').resolves(null)
      proxyquire('../../../lib/validator/group-validator', {
        '../../../services/data-access/group.data.service': groupDataService
      })
    })

    it('should return false if all is OK', async () => {
      const data = {
        name: 'Group Tests 1',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeFalsy()
      expect(result.errors.name).toBeUndefined()
    })
  })

  describe('unhappy paths', () => {
    beforeEach(() => {
      sandbox.mock(groupDataService).expects('fetchGroup').resolves(null)
      proxyquire('../../../lib/validator/group-validator', {
        '../../../services/data-access/group.data.service': groupDataService
      })
    })

    it('should return an error if group name is missing', async () => {
      const data = {
        name: '',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.name).toBe(groupErrorMessages.nameIsRequired)
    })

    it('should return an error if group name is longer than 35 characters', async () => {
      const data = {
        name: 'tenletterstenletterstenletterstenletters',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.name).toBe(groupErrorMessages.nameIsTooLong)
    })

    it('should return an error if group name contains special character', async () => {
      const data = {
        name: 'Test$',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.name).toBe(groupErrorMessages.nameInvalidCharacters)
    })

    it('should return an error if pupils are missing', async () => {
      const data = {
        name: 'Test Group 1'
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.pupils).toBe(groupErrorMessages.missingPupils)
    })
  })
})
