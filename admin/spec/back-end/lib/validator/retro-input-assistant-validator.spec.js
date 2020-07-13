'use strict'

/* global describe beforeEach it expect */
const sut = require('../../../../lib/validator/retro-input-assistant-validator')
const errorMessages = require('../../../../lib/errors/retro-input-assistant')

let retroInputAssistantData = {}

describe('retro input assistant validator', () => {
  beforeEach(() => {
    retroInputAssistantData = {
      firstName: 'john',
      lastName: 'smith',
      reason: 'reason',
      checkId: 1,
      pupilUuid: 'f6275694-267c-449e-b73b-69160c568dbc',
      userId: 1
    }
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should return no validation errors if payload is valid', async () => {
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(false)
  })

  it('should throw if input assistant first name is undefined', async () => {
    retroInputAssistantData.firstName = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const firstNameError = validationResult.get('firstName')
    expect(firstNameError).toEqual(errorMessages.missingFirstName)
  })

  it('should throw if input assistant first name is an empty string', async () => {
    retroInputAssistantData.firstName = ''
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const firstNameError = validationResult.get('firstName')
    expect(firstNameError).toEqual(errorMessages.missingFirstName)
  })

  it('should throw if input assistant last name is undefined', async () => {
    retroInputAssistantData.lastName = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const lastNameError = validationResult.get('lastName')
    expect(lastNameError).toEqual(errorMessages.missingLastName)
  })

  it('should throw if input assistant last name is an empty string', async () => {
    retroInputAssistantData.lastName = ''
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const lastNameError = validationResult.get('lastName')
    expect(lastNameError).toEqual(errorMessages.missingLastName)
  })

  it('should throw if input assistant reason is undefined', async () => {
    retroInputAssistantData.reason = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const reasonError = validationResult.get('reason')
    expect(reasonError).toEqual(errorMessages.missingReason)
  })

  it('should throw if input assistant reason is an empty string', async () => {
    retroInputAssistantData.reason = ''
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const reasonError = validationResult.get('reason')
    expect(reasonError).toEqual(errorMessages.missingReason)
  })

  it('should throw if checkId is undefined', async () => {
    retroInputAssistantData.checkId = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const checkIdError = validationResult.get('checkId')
    expect(checkIdError).toEqual(errorMessages.invalidCheckId)
  })

  it('should throw if checkId is less than 1', async () => {
    retroInputAssistantData.checkId = 0
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const checkIdError = validationResult.get('checkId')
    expect(checkIdError).toEqual(errorMessages.invalidCheckId)
  })

  it('should throw if pupilUuid is undefined', async () => {
    retroInputAssistantData.pupilUuid = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const pupilUuidError = validationResult.get('pupilUuid')
    expect(pupilUuidError).toEqual(errorMessages.invalidPupilUuid)
  })

  it('should throw if pupilUuid is not a valid uuid', async () => {
    retroInputAssistantData.pupilUuid = 'foo'
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const pupilUuidError = validationResult.get('pupilUuid')
    expect(pupilUuidError).toEqual(errorMessages.invalidPupilUuid)
  })

  it('should throw if userId is undefined', async () => {
    retroInputAssistantData.userId = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const checkIdError = validationResult.get('userId')
    expect(checkIdError).toEqual(errorMessages.userId)
  })

  it('should throw if userId is less than 1', async () => {
    retroInputAssistantData.userId = 0
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const checkIdError = validationResult.get('userId')
    expect(checkIdError).toEqual(errorMessages.userId)
  })
})
