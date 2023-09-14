'use strict'

/* global describe test expect beforeEach afterEach fail jest */

const sut = require('../../../services/retro-input-assistant.service')
const dataService = require('../../../services/data-access/retro-input-assistant.data.service.js')
const pupilId = 123
const currentCheckId = 456
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')

function setupDefaultSpies () {
  jest.spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').mockResolvedValue([{
    id: pupilId,
    currentCheckId
  }])
  jest.spyOn(dataService, 'markLatestCompleteCheckAsInputAssistantAddedRetrospectively').mockImplementation()
  jest.spyOn(dataService, 'deleteRetroInputAssistant').mockImplementation()
}

describe('retro input assistant service', () => {
  beforeEach(() => {
    jest.spyOn(dataService, 'create').mockResolvedValue(Promise.resolve())
    jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockResolvedValue()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('save', () => {
    test('should throw an error when validation fails', async () => {
      setupDefaultSpies()
      try {
        await sut.save({})
        fail('error should have been thrown')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })

    test('should throw an error if pupil is frozen', async () => {
      setupDefaultSpies()
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation(() => {
        throw new Error('frozen')
      })
      await expect(sut.save({
        firstName: 'foo',
        lastName: 'bar',
        reason: 'baz',
        pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
        userId: 1
      })).rejects.toThrow('frozen')
    })

    test('should throw when pupilUuid is undefined', async () => {
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

    test('should throw when pupilUuid is not a valid UUID', async () => {
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

    test('should lookup pupil id and current check id from url slug', async () => {
      setupDefaultSpies()
      await sut.save({
        firstName: 'foo',
        lastName: 'bar',
        reason: 'baz',
        pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
        userId: 1
      })
      expect(dataService.getPupilIdAndCurrentCheckIdByUrlSlug).toHaveBeenCalled()
    })

    test('should persist valid input', async () => {
      setupDefaultSpies()
      await sut.save({
        firstName: 'foo',
        lastName: 'bar',
        reason: 'baz',
        pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
        userId: 1
      })
      expect(dataService.create).toHaveBeenCalled()
    })

    test('should throw if pupil details cannot be found', async () => {
      jest.spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').mockResolvedValue()
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

    test('should throw if lookedup pupil id is not a number greater than zero', async () => {
      jest.spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').mockResolvedValue([{
        id: undefined,
        currentCheckId: 1
      }])
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
        expect(error.message).toBe('invalid pupil.id returned from lookup: id:undefined')
      }
    })

    test('should throw if lookedup current check id is not a number greater than zero', async () => {
      jest.spyOn(dataService, 'getPupilIdAndCurrentCheckIdByUrlSlug').mockResolvedValue([{
        id: 1,
        currentCheckId: undefined
      }])
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
        expect(error.message).toBe('invalid pupil.currentCheckId returned from lookup: id:undefined')
      }
    })

    test('should mark existing live check as added retrospectively', async () => {
      setupDefaultSpies()
      await sut.save({
        firstName: 'foo',
        lastName: 'bar',
        reason: 'baz',
        pupilUuid: '6d94ad35-d240-42eb-a945-9a325758349b',
        userId: 1
      })
      expect(dataService.markLatestCompleteCheckAsInputAssistantAddedRetrospectively).toHaveBeenCalledWith(currentCheckId)
      expect(dataService.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('getEligiblePupilsWithFullNames', () => {
    test('should throw an error if school id not provided', async () => {
      setupDefaultSpies()
      try {
        await sut.getEligiblePupilsWithFullNames()
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('schoolId is not provided')
      }
    })
  })

  describe('deleteFromCurrentCheck', () => {
    test('should throw an error if pupilUrlSlug not provided', async () => {
      setupDefaultSpies()
      try {
        await sut.deleteFromCurrentCheck()
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('pupilUrlSlug not provided')
      }
    })

    test('should throw an error if pupilUrlSlug is not a valid UUID', async () => {
      setupDefaultSpies()
      try {
        await sut.deleteFromCurrentCheck('not a uuid')
        fail('error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('pupilUrlSlug is not a valid UUID')
      }
    })

    test('should throw an error if pupil is frozen', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation(() => {
        throw new Error('frozen')
      })
      await expect(sut.deleteFromCurrentCheck('6195f068-a0e1-4881-bb22-4edf337c5688')).rejects.toThrow('frozen')
    })

    test('should call data service if pupilUrlSlug is a valid UUID', async () => {
      setupDefaultSpies()
      try {
        await sut.deleteFromCurrentCheck('6195f068-a0e1-4881-bb22-4edf337c5688')
        expect(dataService.deleteRetroInputAssistant).toHaveBeenCalledTimes(1)
      } catch (error) {
        fail(error.message)
      }
    })
  })
})
