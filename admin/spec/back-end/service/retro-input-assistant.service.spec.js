'use strict'

/* global describe it expect beforeEach spyOn fail */

const sut = require('../../../services/retro-input-assistant.service')
const dataService = require('../../../services/data-access/retro-input-assistant.data.service.js')

describe('retro input assistant service', () => {
  beforeEach(() => {
    spyOn(dataService, 'create')
    spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').and.returnValue({
      pupilId: 123,
      currentCheckId: 456
    })
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should throw an error when validation fails', async () => {
    try {
      await sut.save({})
      fail('error should have been thrown')
    } catch (error) {
      expect(error.name).toBe('ValidationError')
    }
  })

  it('should lookup pupil id and current check id from url slug', async () => {
    await sut.save({
      firstName: 'foo',
      lastName: 'bar',
      reason: 'baz',
      pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
      userId: 1
    })
    expect(dataService.getPupilIdAndCurrentCheckIdByUrlSlug).toHaveBeenCalled()
  })

  it('should persist valid input', async () => {
    await sut.save({
      firstName: 'foo',
      lastName: 'bar',
      reason: 'baz',
      pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
      userId: 1
    })
    expect(dataService.create).toHaveBeenCalled()
  })
})
