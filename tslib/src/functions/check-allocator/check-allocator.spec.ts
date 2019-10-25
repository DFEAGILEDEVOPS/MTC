import * as uuid from 'uuid'
import moment from 'moment'
import config from '../../config'
import { SchoolCheckAllocationService } from './check-allocator'
import { IPupil, ISchoolAllocation } from './models'
import { ICheckAllocationDataService } from './check-allocation.data.service'
import { IDateTimeService } from '../../common/DateTimeService'
import { IPupilAllocationService } from './pupil-allocation.service'
import { IRedisService } from '../../caching/redis-service'
import { ConsoleLogger } from '../../common/ILogger'

let sut: SchoolCheckAllocationService

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

const CheckAllocationDataServiceMock = jest.fn<ICheckAllocationDataService, any>(() => ({
  getPupilsBySchoolUuid: jest.fn(),
  getFormsUsedByPupil: jest.fn(),
  getAllForms: jest.fn()
}))

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn()
}))

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn(),
  formatIso8601: jest.fn(),
  convertDateToMoment: jest.fn(),
  convertMomentToJsDate: jest.fn()
}))

const PupilAllocationServiceMock = jest.fn<IPupilAllocationService, any>(() => ({
  allocate: jest.fn()
}))

let checkAllocationDataServiceMock: ICheckAllocationDataService
let redisServiceMock: IRedisService
let dateTimeServiceMock: IDateTimeService
let pupilAllocationServiceMock: IPupilAllocationService

describe('check-allocator/v1', () => {
  beforeEach(() => {
    schoolUUID = uuid.v4()
    checkAllocationDataServiceMock = new CheckAllocationDataServiceMock()
    redisServiceMock = new RedisServiceMock()
    dateTimeServiceMock = new DateTimeServiceMock()
    pupilAllocationServiceMock = new PupilAllocationServiceMock()
    sut = new SchoolCheckAllocationService(new ConsoleLogger(), checkAllocationDataServiceMock, redisServiceMock,
      dateTimeServiceMock, pupilAllocationServiceMock)
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

    checkAllocationDataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key) => {
      return Promise.resolve({
        pupils: []
      })
    })
    await sut.allocate(schoolUUID)
    expect(checkAllocationDataServiceMock.getPupilsBySchoolUuid).toHaveBeenCalledWith(schoolUUID)
  })

  test('an allocation is created for all pupils when none have one', async () => {

    checkAllocationDataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: []
      }
    })
    await sut.allocate(schoolUUID)
    expect(pupilAllocationServiceMock.allocate).toHaveBeenCalledTimes(pupilData.length)
  })

  test('an allocation is only created for pupils that do not currently have one', async () => {

    checkAllocationDataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: [
          pupilData[2]
        ]
      }
    })
    await sut.allocate(schoolUUID)
    expect(pupilAllocationServiceMock.allocate).toHaveBeenCalledTimes(pupilData.length - 1)
  })

  test('the top level object is stamped with last utc datetime of last replenishment', async () => {

    checkAllocationDataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupils: []
      }
    })
    let persistedRedisObject: ISchoolAllocation = {
      lastReplenishmentUtc: moment(),
      pupils: [],
      schoolUUID: uuid.v4()
    }
    redisServiceMock.setex = jest.fn(async (key: string, value: any, ttl: number) => {
      persistedRedisObject = value
    })
    const millenium = '2000-01-01 00:00'
    dateTimeServiceMock.utcNow = jest.fn(() => {
      return moment(millenium)
    })
    await sut.allocate(schoolUUID)
    expect(persistedRedisObject).toHaveProperty('lastReplenishmentUtc')
    expect(persistedRedisObject.lastReplenishmentUtc).toEqual(moment(millenium))
  })

  test('the cache is updated with all school pupils', async () => {

    checkAllocationDataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(pupilData)
    })
    const existingRedisObject = {
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
      return Promise.resolve(existingRedisObject)
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
    expect(pupilAllocationServiceMock.allocate).toHaveBeenCalledTimes(1)
    expect(pupilAllocationServiceMock.allocate).toHaveBeenCalledWith(pupilData[2])
    expect(dateTimeServiceMock.utcNow).toHaveBeenCalledTimes(1)
    expect(redisServiceMock.get).toHaveBeenCalledWith(redisSchoolKey)
    expect(redisServiceMock.get).toHaveBeenCalledTimes(1)
    expect(redisSetKey).toBe(redisSchoolKey)
    expect(redisSetTtl).toBe(config.CheckAllocation.ExpiryTimeInSeconds)
    expect(redisServiceMock.setex).toHaveBeenCalledTimes(1)
  })
})
