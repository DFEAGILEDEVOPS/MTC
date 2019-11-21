import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { IPreparedCheckMergeService, ICheckConfig } from './prepared-check-merge.service'
import { IPreparedCheckSyncDataService, IActiveCheckReference } from './prepared-check-sync.data.service'
import { IRedisService } from '../../caching/redis-service'
import { RedisServiceMock } from '../../caching/redis-service.mock'

let sut: PreparedCheckSyncService
let dataServiceMock: IPreparedCheckSyncDataService
let mergeServiceMock: IPreparedCheckMergeService
let redisServiceMock: IRedisService

const PreparedCheckSyncDataServiceMock = jest.fn<IPreparedCheckSyncDataService, any>(() => ({
  getActiveCheckReferencesByPupilUuid: jest.fn(),
  getAccessArrangementsCodesByIds: jest.fn(),
  getAccessArrangementsByCheckCode: jest.fn()
}))

const PreparedCheckMergeServiceMock = jest.fn<IPreparedCheckMergeService, any>(() => ({
  merge: jest.fn()
}))

describe('prepared-check-sync.service', () => {

  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    dataServiceMock = new PreparedCheckSyncDataServiceMock()
    mergeServiceMock = new PreparedCheckMergeServiceMock()
    sut = new PreparedCheckSyncService(dataServiceMock, mergeServiceMock, redisServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('active checks for pupil are looked up and returns early if none found', async () => {
    const pupilUUID = 'pupilUUID'
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return []
    })
    await sut.process(pupilUUID)
    expect(dataServiceMock.getActiveCheckReferencesByPupilUuid).toHaveBeenCalled()
    expect(redisServiceMock.setex).not.toHaveBeenCalled()
  })

  test('each active check is sent to the merger service', async () => {
    const pupilUUID = 'pupilUUID'
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      const refs: Array<IActiveCheckReference> = [
        {
          checkCode: 'checkCode',
          pupilPin: '1234',
          schoolPin: 'abc12def'
        },
        {
          checkCode: 'checkCode',
          pupilPin: '1234',
          schoolPin: 'abc12def'
        },
        {
          checkCode: 'checkCode',
          pupilPin: '1234',
          schoolPin: 'abc12def'
        }
      ]
      return refs
    })
    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        checkCode: 'checkCode'
      }
    })
    await sut.process(pupilUUID)
    expect(mergeServiceMock.merge).toHaveBeenCalledTimes(3)
  })

  test('updated check is submitted back to redis with TTL preserved', async () => {
    const originalTTL = 300
    const pupilUUID = 'pupilUUID'
    const activeCheckReference = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    const cacheKey = `preparedCheck:${activeCheckReference.schoolPin}:${activeCheckReference.pupilPin}`
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return [activeCheckReference]
    })

    redisServiceMock.ttl = jest.fn(async (key: string) => {
      return originalTTL
    })

    const aaConfig = {
      audibleSounds: false,
      inputAssistance: false,
      numpadRemoval: false,
      fontSize: false,
      colourContrast: false,
      questionReader: false,
      nextBetweenQuestions: false
    }

    const checkConfig: ICheckConfig = {
      questionTime: 5,
      loadingTime: 5,
      speechSynthesis: false,
      practice: false,
      ...aaConfig
    }

    redisServiceMock.get = jest.fn(async (key: string) => {
      return checkConfig
    })

    mergeServiceMock.merge = jest.fn(async (preparedCheck: any) => {
      return preparedCheck
    })

    await sut.process(pupilUUID)
    expect(redisServiceMock.setex).toHaveBeenCalledWith(cacheKey, checkConfig, originalTTL)
  })

  test('error is thrown if preparedCheck is not found', async () => {
    const originalTTL = 300
    const pupilUUID = 'pupilUUID'
    const checkRef = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return [checkRef]
    })

    redisServiceMock.ttl = jest.fn(async (key: string) => {
      return originalTTL
    })

    redisServiceMock.get = jest.fn(async (key: string) => {
      return null
    })

    try {
      await sut.process(pupilUUID)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe(`unable to find preparedCheck in redis. checkCode:${checkRef.checkCode}`)
    }
  })

  test('error is thrown if ttl is not found', async () => {
    const pupilUUID = 'pupilUUID'
    const checkRef = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return [checkRef]
    })

    redisServiceMock.ttl = jest.fn(async (key: string) => {
      return null
    })

    redisServiceMock.get = jest.fn(async (key: string) => {
      return {
        pupilPin: 1234,
        schoolPin: 'abc34def'
      }
    })

    try {
      await sut.process(pupilUUID)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe(`no TTL found on preparedCheck. checkCode:${checkRef.checkCode}`)
    }
  })
})
