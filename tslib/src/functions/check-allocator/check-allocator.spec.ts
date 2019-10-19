import {
  CheckAllocatorV1 } from './check-allocator'
import { ICheckFormAllocationService } from "./ICheckFormAllocationService"
import { IPupil, ISchoolAllocation } from "./IPupil"
import { ICheckAllocatorDataService } from './ICheckAllocatorDataService'
import { IDateTimeService } from '../../common/DateTimeService'
import * as uuid from 'uuid'
import { IRedisService } from '../../caching/redis-service'
import * as config from '../../config'

let sut: CheckAllocatorV1

let schoolUUID: string

const pupilData: Array<IPupil> = [
  {
    id: 123
  },
  {
    id: 456
  },
  {
    id: 789
  }
]

const DataServiceMock = jest.fn<ICheckAllocatorDataService, any>(() => ({
  getPupilsBySchoolUuid: jest.fn()
}))

const PupilPinGeneratorMock = jest.fn<IPupilPinGenerationService, any>(() => ({
  generate: jest.fn()
}))

const CheckFormAllocatorMock = jest.fn<ICheckFormAllocationService, any>(() => ({
  allocate: jest.fn()
}))

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn()
}))

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn()
}))

let dataServiceMock: ICheckAllocatorDataService
let pupilPinGeneratorMock: IPupilPinGenerationService
let checkFormAllocatorMock: ICheckFormAllocationService
let redisServiceMock: IRedisService
let dateTimeServiceMock: IDateTimeService

describe('check-allocator/v1', () => {
  beforeEach(() => {
    schoolUUID = uuid.v4()
    dataServiceMock = new DataServiceMock()
    pupilPinGeneratorMock = new PupilPinGeneratorMock()
    checkFormAllocatorMock = new CheckFormAllocatorMock()
    redisServiceMock = new RedisServiceMock()
    dateTimeServiceMock = new DateTimeServiceMock()
    sut = new CheckAllocatorV1(dataServiceMock, pupilPinGeneratorMock,
      checkFormAllocatorMock, redisServiceMock, dateTimeServiceMock)
  })

  test('it should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('an error is thrown when school UUID is not a valid UUID', async () => {
    const invalidUUIDvalues = [
      'i am not a UUID', // clearly incorrect
      '64b182f0-04fc-4dac-88c3-', // final section missing
      '64b182f0-04fc-4dac-88c3-dc6fcb1cba5' // one char short
    ]
    for (let index = 0; index < invalidUUIDvalues.length; index++) {
      const invalidUUID = invalidUUIDvalues[index]
      try {
        await sut.allocate(invalidUUID)
        fail('an error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('schoolUUID argument was not a v4 UUID')
      }
    }
  })

  test('it should fetch all pupils within specified school from data service', async () => {
    const existingRedisData = {
      schoolUUID: schoolUUID,
      pupils: []}

    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key) => {
      return Promise.resolve(existingRedisData)
    })
    await sut.allocate(schoolUUID)
    expect(dataServiceMock.getPupilsBySchoolUuid).toHaveBeenCalledWith(schoolUUID)
  })

  test('a pupil pin is generated for each pupil that does not currently have an allocation', async () => {

    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: []
      }
    })
    await sut.allocate(schoolUUID)
    expect(pupilPinGeneratorMock.generate).toHaveBeenCalledTimes(pupilData.length)
  })

  test('a form is allocated for each pupil that does not currently have an allocation', async () => {

    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: []
      }
    })
    await sut.allocate(schoolUUID)
    expect(checkFormAllocatorMock.allocate).toHaveBeenCalledTimes(pupilData.length)
  })

  test('each allocation is stamped with the current UTC datetime', async () => {

    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: []
      }
    })
    await sut.allocate(schoolUUID)
    expect(dateTimeServiceMock.utcNow).toHaveBeenCalledTimes(pupilData.length + 1)
  })

  test('the top level object is stamped with last utc datetime of last replenishment', async () => {

    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: []
      }
    })
    let persistedRedisObject: ISchoolAllocation = {
      lastReplenishmentUtc: new Date(),
      pupils: [],
      schoolUUID: uuid.v4()
    }
    redisServiceMock.setex = jest.fn(async (key: string, value: any, ttl: number) => {
      persistedRedisObject = value
    })
    const millenium = '2000-01-01 00:00'
    dateTimeServiceMock.utcNow = jest.fn(() => {
      return new Date(millenium)
    })
    await sut.allocate(schoolUUID)
    expect(persistedRedisObject).toHaveProperty('lastReplenishmentUtc')
    expect(persistedRedisObject.lastReplenishmentUtc).toEqual(new Date(millenium))
  })

  test('only pupils without an existing allocation are replenished', async () => {

    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    pupilPinGeneratorMock.generate = jest.fn(() => {
      return 1234
    })
    const existingRedisSchoolObject = {
      schoolUUID: schoolUUID,
      pupils: [
        {
          id: 123,
          pin: 1234,
          allocatedForm: undefined,
          allocatedAtUtc: '2001-01-01 00:00'
        },
        {
          id: 456,
          pin: 1234,
          allocatedForm: undefined,
          allocatedAtUtc: '2001-01-01 00:00'
        }
      ]
    }
    redisServiceMock.get = jest.fn((key) => {
      return Promise.resolve(existingRedisSchoolObject)
    })
    let redisSetKey
    let redisSetTtl
    redisServiceMock.setex = jest.fn((key, value, ttl) => {
      redisSetKey = key
      redisSetTtl = ttl
      return Promise.resolve()
    })

    await sut.allocate(schoolUUID)
    const redisSchoolKey = `pupil-allocations:${schoolUUID}`
    expect(checkFormAllocatorMock.allocate).toHaveBeenCalledTimes(1)
    expect(checkFormAllocatorMock.allocate).toHaveBeenCalledWith(789)
    expect(dateTimeServiceMock.utcNow).toHaveBeenCalledTimes(2)
    expect(pupilPinGeneratorMock.generate).toHaveBeenCalledTimes(1)
    expect(redisServiceMock.get).toHaveBeenCalledWith(redisSchoolKey)
    expect(redisServiceMock.get).toHaveBeenCalledTimes(1)
    expect(redisSetKey).toBe(redisSchoolKey)
    expect(redisSetTtl).toBe(config.default.CheckAllocation.ExpiryTimeInSeconds)
    expect(redisServiceMock.setex).toHaveBeenCalledTimes(1)
  })

  test.todo('the school pin is only regenerated on the overnight run - separate service?')
})
