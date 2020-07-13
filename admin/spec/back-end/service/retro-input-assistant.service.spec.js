'use strict'

/* global describe it expect beforeEach spyOn */

const sut = require('../../../services/retro-input-assistant.service')
const dataService = require('../../../services/data-access/retro-input-assistant.data.service.js')

describe('retro input assistant service', () => {
  beforeEach(() => {
    spyOn(dataService, 'create')
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should perform validation on input', async () => {
    const validationResult = await sut.save({})
    expect(validationResult.hasError()).toBe(true)
    const errors = validationResult.getFields()
    expect(errors.length).toBe(6)
  })

  it('should persist valid input', async () => {
    await sut.save({
      firstName: 'foo',
      lastName: 'bar',
      reason: 'baz',
      checkId: 5,
      pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
      userId: 1
    })
    expect(dataService.create).toHaveBeenCalled()
  })
})
