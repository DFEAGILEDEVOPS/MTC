'use strict'

const groupValidator = require('../../../../lib/validator/group-validator')
const groupDataService = require('../../../../services/data-access/group.data.service')
const groupErrorMessages = require('../../../../lib/errors/group').group

describe('groupValidation', function () {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('happy path', () => {
    beforeEach(() => {
      jest.spyOn(groupDataService, 'sqlFindOneByName').mockReturnValue(null)
    })

    test('should return false if all is OK', async () => {
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
      jest.spyOn(groupDataService, 'sqlFindOneByName').mockReturnValue(null)
    })

    test('should return an error if group name is missing', async () => {
      const data = {
        name: '',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.name).toBe(groupErrorMessages.nameIsRequired)
    })

    test('should return an error if group name is longer than 35 characters', async () => {
      const data = {
        name: 'tenletterstenletterstenletterstenletters',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.name).toBe(groupErrorMessages.nameIsTooLong)
    })

    test('should return an error if group name contains special character', async () => {
      const data = {
        name: 'Test$',
        pupil: [1, 2, 3]
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.name).toBe(groupErrorMessages.nameInvalidCharacters)
    })

    test('should return an error if pupils are missing', async () => {
      const data = {
        name: 'Test Group 1'
      }
      const result = await groupValidator.validate(data, '')
      expect(result.hasError()).toBeTruthy()
      expect(result.errors.pupils).toBe(groupErrorMessages.missingPupils)
    })
  })
})
