'use strict'

const settingsValidator = require('../../../../lib/validator/settings-validator')

describe('Settings validator', function () {
  let req = null

  function getBody () {
    return {
      questionTimeLimit: '20',
      loadingTimeLimit: '3',
      checkTimeLimit: '30',
      isPostAdminEndDateUnavailable: false
    }
  }

  beforeEach(function () {
    req = {
      query: {},
      body: {},
      params: {},
      param: (name) => {
        this.params[name] = name
      }
    }
  })

  test('should allow a valid request', async () => {
    req.body = getBody()
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(false)
  })

  test('should require questionTimeLimit as mandatory', async () => {
    req.body = getBody()
    req.body.questionTimeLimit = ''
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('questionTimeLimit')).toBe(true)
  })

  test('should require questionTimeLimit to be at least 1', async () => {
    req.body = getBody()
    req.body.questionTimeLimit = '0'
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('questionTimeLimit')).toBe(true)
  })

  test('should require questionTimeLimit to be not greater than 60', async () => {
    req.body = getBody()
    req.body.questionTimeLimit = '62'
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('questionTimeLimit')).toBe(true)
  })

  test('should require loadingTimeLimit as mandatory', async () => {
    req.body = getBody()
    req.body.loadingTimeLimit = ''
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('loadingTimeLimit')).toBe(true)
  })

  test('should require loadingTimeLimit to be at least 1', async () => {
    req.body = getBody()
    req.body.loadingTimeLimit = '0'
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('loadingTimeLimit')).toBe(true)
  })

  test('should require loadingTimeLimit to be no more than 5', async () => {
    req.body = getBody()
    req.body.loadingTimeLimit = '7'
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('loadingTimeLimit')).toBe(true)
  })

  test('should require checkTimeLimit as mandatory', async () => {
    req.body = getBody()
    req.body.checkTimeLimit = ''
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('checkTimeLimit')).toBe(true)
  })

  test('should require checkTimeLimit to be at least 10', async () => {
    req.body = getBody()
    req.body.checkTimeLimit = '9'
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('checkTimeLimit')).toBe(true)
  })

  test('should require checkTimeLimit to be not greater than 90', async () => {
    req.body = getBody()
    req.body.checkTimeLimit = '91'
    const validationError = await settingsValidator.validate(req.body)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('checkTimeLimit')).toBe(true)
  })
})
