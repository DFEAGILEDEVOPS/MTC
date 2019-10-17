import { CheckAllocatorV1, ICheckAllocatorDataService, IPupilPinGenerator, ICheckFormAllocator } from './check-allocator'
import * as uuid from 'uuid'
import { IRedisService } from '../../caching/redis-service'

let sut: CheckAllocatorV1

let schoolUUID: string

const pupilData = [
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

const PupilPinGeneratorMock = jest.fn<IPupilPinGenerator, any>(() => ({
  generate: jest.fn()
}))

const CheckFormAllocatorMock = jest.fn<ICheckFormAllocator, any>(() => ({
  allocate: jest.fn()
}))

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn()
}))

let dataServiceMock: ICheckAllocatorDataService
let pupilPinGeneratorMock: IPupilPinGenerator
let checkFormAllocatorMock: ICheckFormAllocator
let redisServiceMock: IRedisService

describe('check-allocator/v1', () => {
  beforeEach(() => {
    schoolUUID = uuid.v4()
    dataServiceMock = new DataServiceMock()
    pupilPinGeneratorMock = new PupilPinGeneratorMock()
    checkFormAllocatorMock = new CheckFormAllocatorMock()
    redisServiceMock = new RedisServiceMock()
    sut = new CheckAllocatorV1(dataServiceMock, pupilPinGeneratorMock,
      checkFormAllocatorMock, redisServiceMock)
  })

  test('it should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('an error is thrown when school UUID is not a valid UUID', async () => {
    const invalidUuidValues = [
      'i am not a UUID', // clearly incorrect
      '64b182f0-04fc-4dac-88c3-', // final section missing
      '64b182f0-04fc-4dac-88c3-dc6fcb1cba5' // one char short
    ]
    for (let index = 0; index < invalidUuidValues.length; index++) {
      const invalidUuid = invalidUuidValues[index]
      try {
        await sut.allocate(invalidUuid)
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

  test('a pupil pin is generated  for each pupil that does not currently have an allocation', async () => {

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

  test('pupils with an existing allocation are not replenished', async () => {

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
          allocatedForm: undefined
        },
        {
          id: 456,
          pin: 1234,
          allocatedForm: undefined
        }
      ]
    }
    const expectedSchoolObjectToBeSet = {
      schoolUUID: schoolUUID,
      pupils: [
        {
          id: 123,
          pin: 1234,
          allocatedForm: undefined
        },
        {
          id: 456,
          pin: 1234,
          allocatedForm: undefined
        },
        {
          id: 789,
          pin: 1234,
          allocatedForm: undefined
        }
      ]
    }
    redisServiceMock.get = jest.fn((key) => {
      return Promise.resolve(existingRedisSchoolObject)
    })
    await sut.allocate(schoolUUID)
    const redisSchoolKey = `pupil-allocations:${schoolUUID}`
    expect(checkFormAllocatorMock.allocate).toHaveBeenCalledTimes(1)
    expect(checkFormAllocatorMock.allocate).toHaveBeenCalledWith(789)
    expect(pupilPinGeneratorMock.generate).toHaveBeenCalledTimes(1)
    expect(redisServiceMock.get).toHaveBeenCalledWith(redisSchoolKey)
    expect(redisServiceMock.get).toHaveBeenCalledTimes(1)
    expect(redisServiceMock.setex).toHaveBeenCalledWith(redisSchoolKey, expectedSchoolObjectToBeSet, 0)
    expect(redisServiceMock.setex).toHaveBeenCalledTimes(1)
  })

  test.todo('a redis entry is created for each replenished allocation')
  test.todo('the redis entry contains the current timestamp in UTC')
  test.todo('the school pin is only regenerated on the overnight run - separate service?')
})
