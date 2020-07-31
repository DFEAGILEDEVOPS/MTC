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
      pupilUuid: '9495e6b6-234c-4a2a-83a1-9671358fad80',
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

  it('should invalidate if input assistant first name is undefined', async () => {
    retroInputAssistantData.firstName = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const firstNameError = validationResult.get('firstName')
    expect(firstNameError).toEqual(errorMessages.invalidFirstName)
  })

  it('should invalidate if input assistant first name is an empty string', async () => {
    retroInputAssistantData.firstName = ''
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const firstNameError = validationResult.get('firstName')
    expect(firstNameError).toEqual(errorMessages.invalidFirstName)
  })

  it('should invalidate if input assistant first name is longer than 128 chars', async () => {
    retroInputAssistantData.firstName = 'x'.repeat(129)
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const firstNameError = validationResult.get('firstName')
    expect(firstNameError).toEqual(errorMessages.invalidFirstName)
  })

  it('should invalidate if input assistant last name is undefined', async () => {
    retroInputAssistantData.lastName = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const lastNameError = validationResult.get('lastName')
    expect(lastNameError).toEqual(errorMessages.invalidLastName)
  })

  it('should invalidate if input assistant last name is an empty string', async () => {
    retroInputAssistantData.lastName = ''
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const lastNameError = validationResult.get('lastName')
    expect(lastNameError).toEqual(errorMessages.invalidLastName)
  })

  it('should invalidate if input assistant last name is longer than 128 chars', async () => {
    retroInputAssistantData.lastName = 'x'.repeat(129)
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const firstNameError = validationResult.get('lastName')
    expect(firstNameError).toEqual(errorMessages.invalidLastName)
  })

  it('should invalidate if input assistant reason is undefined', async () => {
    retroInputAssistantData.reason = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const reasonError = validationResult.get('reason')
    expect(reasonError).toEqual(errorMessages.missingReason)
  })

  it('should invalidate if input assistant reason is an empty string', async () => {
    retroInputAssistantData.reason = ''
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const reasonError = validationResult.get('reason')
    expect(reasonError).toEqual(errorMessages.missingReason)
  })

  it('should invalidate if pupilUuid is undefined', async () => {
    retroInputAssistantData.pupilUuid = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const pupilIdError = validationResult.get('pupilUuid')
    expect(pupilIdError).toEqual(errorMessages.invalidPupilUuid)
  })

  it('should invalidate if pupil id is not a valid UUID', async () => {
    retroInputAssistantData.pupilUuid = 'foo'
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const pupilIdError = validationResult.get('pupilUuid')
    expect(pupilIdError).toEqual(errorMessages.invalidPupilUuid)
  })

  it('should invalidate if userId is undefined', async () => {
    retroInputAssistantData.userId = undefined
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const checkIdError = validationResult.get('userId')
    expect(checkIdError).toEqual(errorMessages.userId)
  })

  it('should invalidate if userId is less than 1', async () => {
    retroInputAssistantData.userId = 0
    const validationResult = await sut.validate(retroInputAssistantData)
    expect(validationResult.hasError()).toBe(true)
    const checkIdError = validationResult.get('userId')
    expect(checkIdError).toEqual(errorMessages.userId)
  })
})
