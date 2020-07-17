'use strict'

/* global describe it expect beforeEach spyOn fail */

const sut = require('../../../services/retro-input-assistant.service')
const dataService = require('../../../services/data-access/retro-input-assistant.data.service.js')

function setupPupilLookupSpy () {
  spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').and.returnValue([{
    id: 123,
    currentCheckId: 456
  }])
}

describe('retro input assistant service', () => {
  beforeEach(() => {
    spyOn(dataService, 'create')
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('save', () => {
    it('should throw an error when validation fails', async () => {
      setupPupilLookupSpy()
      try {
        await sut.save({})
        fail('error should have been thrown')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })
    it('should throw when pupilUuid is undefined', async () => {
      try {
        await sut.save({
          firstName: 'foo',
          lastName: 'bar',
          reason: 'baz',
          pupilUuid: undefined,
          userId: 1
        })
        fail('expected error to be thrown')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })
    it('should throw when pupilUuid is not a valid UUID', async () => {
      try {
        await sut.save({
          firstName: 'foo',
          lastName: 'bar',
          reason: 'baz',
          pupilUuid: 'quix',
          userId: 1
        })
        fail('expected error to be thrown')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })
    it('should lookup pupil id and current check id from url slug', async () => {
      setupPupilLookupSpy()
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
      setupPupilLookupSpy()
      await sut.save({
        firstName: 'foo',
        lastName: 'bar',
        reason: 'baz',
        pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
        userId: 1
      })
      expect(dataService.create).toHaveBeenCalled()
    })
    it('should throw if pupil details cannot be found', async () => {
      spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').and.returnValue()
      try {
        await sut.save({
          firstName: 'foo',
          lastName: 'bar',
          reason: 'baz',
          pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
          userId: 1
        })
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('pupil lookup failed')
      }
    })
  })
  describe('getEligiblePupilsWithFullNames', () => {
    it('should throw an error if school id not provided', async () => {
      setupPupilLookupSpy()
      try {
        await sut.getEligiblePupilsWithFullNames()
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('schoolId is not provided')
      }
    })
  })
})
