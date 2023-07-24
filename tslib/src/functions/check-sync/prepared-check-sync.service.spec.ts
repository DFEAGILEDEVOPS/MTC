import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { type IPreparedCheckMergeService, type ICheckConfig } from './prepared-check-merge.service'
import { type IPreparedCheckSyncDataService, type IActiveCheckReference } from './prepared-check-sync.data.service'
import { type IRedisService } from '../../caching/redis-service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { ConsoleLogger, type ILogger } from '../../common/logger'

let sut: PreparedCheckSyncService
let dataServiceMock: IPreparedCheckSyncDataService
let mergeServiceMock: IPreparedCheckMergeService
let redisServiceMock: IRedisService
let consoleLogger: ILogger

const PreparedCheckSyncDataServiceMock = jest.fn<IPreparedCheckSyncDataService, any>(() => ({
  getActiveCheckReferencesByPupilUuid: jest.fn(),
  getAccessArrangementsCodesByIds: jest.fn(),
  getAccessArrangementsByCheckCode: jest.fn(),
  sqlUpdateCheckConfig: jest.fn()
}))

const PreparedCheckMergeServiceMock = jest.fn<IPreparedCheckMergeService, any>(() => ({
  merge: jest.fn()
}))

describe('prepared-check-sync.service', () => {
  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    dataServiceMock = new PreparedCheckSyncDataServiceMock()
    mergeServiceMock = new PreparedCheckMergeServiceMock()
    consoleLogger = new ConsoleLogger()
    sut = new PreparedCheckSyncService(dataServiceMock, mergeServiceMock, redisServiceMock, consoleLogger)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('active checks for pupil are looked up and returns early if none found', async () => {
    const pupilUUID = 'pupilUUID'
    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => {
      return []
    })
    await sut.process(pupilUUID)
    expect(dataServiceMock.getActiveCheckReferencesByPupilUuid).toHaveBeenCalledWith(expect.any(String))
    expect(redisServiceMock.setex).not.toHaveBeenCalled()
  })

  test('each active check is sent to the merger service', async () => {
    const pupilUUID = 'pupilUUID'
    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => {
      const refs: IActiveCheckReference[] = [
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
    jest.spyOn(redisServiceMock, 'get').mockImplementation(async () => {
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
    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => {
      return [activeCheckReference]
    })

    jest.spyOn(redisServiceMock, 'ttl').mockImplementation(async () => {
      return originalTTL
    })

    const checkConfig: ICheckConfig = {
      questionTime: 5,
      loadingTime: 5,
      speechSynthesis: false,
      practice: false,
      audibleSounds: false,
      inputAssistance: false,
      numpadRemoval: false,
      fontSize: false,
      colourContrast: false,
      questionReader: false,
      nextBetweenQuestions: false
    }

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async () => {
      return {
        config: checkConfig
      }
    })

    jest.spyOn(mergeServiceMock, 'merge').mockImplementation(async (checkConfig: any) => {
      return checkConfig
    })

    const expected = {
      config: checkConfig
    }

    await sut.process(pupilUUID)
    expect(redisServiceMock.setex).toHaveBeenCalledWith(cacheKey, expected, originalTTL)
  })

  test('error is logged if preparedCheck is not found', async () => {
    const originalTTL = 300
    const pupilUUID = 'pupilUUID'
    const checkRef = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => [checkRef])

    jest.spyOn(redisServiceMock, 'ttl').mockImplementation(async () => originalTTL)

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async () => null)

    jest.spyOn(consoleLogger, 'info')

    await sut.process(pupilUUID)
    expect(consoleLogger.info).toHaveBeenCalledWith(`check-sync: unable to find preparedCheck in redis: checkCode:${checkRef.checkCode}`)
  })

  test('error is logged if ttl is not found, and the ttl set to 300 seconds', async () => {
    const pupilUUID = 'pupilUUID'
    const checkRef = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => [checkRef])

    jest.spyOn(redisServiceMock, 'ttl').mockImplementation(async () => null)

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async () => {
      return {
        pupilPin: 1234,
        schoolPin: 'abc34def'
      }
    })
    jest.spyOn(consoleLogger, 'error')

    await sut.process(pupilUUID)
    expect(consoleLogger.error).toHaveBeenCalledWith(`check-sync: no TTL found on preparedCheck: checkCode:${checkRef.checkCode}`)
  })

  test('the updated check config is stored in the SQL database', async () => {
    const originalTTL = 300

    const pupilUUID = 'pupilUUID'

    const checkRef = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }

    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => [checkRef])

    // Use this as the existing config
    const checkConfig: ICheckConfig = {
      questionTime: 6,
      loadingTime: 3,
      practice: false,
      audibleSounds: false,
      inputAssistance: false,
      numpadRemoval: false,
      fontSize: false,
      colourContrast: false,
      questionReader: false,
      nextBetweenQuestions: false
    }

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async () => {
      return {
        config: checkConfig
      }
    })

    // Mock the new config which is picked up from the db
    jest.spyOn(dataServiceMock, 'getAccessArrangementsByCheckCode').mockResolvedValue([
      { accessArrangements_id: 1, pupilFontSizeCode: null, pupilColourContrastCode: null },
      { accessArrangements_id: 2, pupilFontSizeCode: null, pupilColourContrastCode: null },
      { accessArrangements_id: 3, pupilFontSizeCode: null, pupilColourContrastCode: null },
      { accessArrangements_id: 4, pupilFontSizeCode: null, pupilColourContrastCode: null },
      { accessArrangements_id: 5, pupilFontSizeCode: null, pupilColourContrastCode: null },
      { accessArrangements_id: 6, pupilFontSizeCode: null, pupilColourContrastCode: null },
      { accessArrangements_id: 7, pupilFontSizeCode: null, pupilColourContrastCode: null }
    ])

    jest.spyOn(redisServiceMock, 'ttl').mockImplementation(async () => originalTTL)

    const mockUpdatedConfig: ICheckConfig = {
      audibleSounds: true,
      checkTime: 30,
      colourContrast: true,
      compressCompletedCheck: true,
      fontSize: true,
      inputAssistance: true,
      loadingTime: 3,
      nextBetweenQuestions: true,
      numpadRemoval: true,
      practice: true,
      questionReader: true,
      questionTime: 6
    }

    jest.spyOn(mergeServiceMock, 'merge').mockResolvedValue(mockUpdatedConfig)

    await sut.process(pupilUUID)

    expect(dataServiceMock.sqlUpdateCheckConfig).toHaveBeenCalledWith(checkRef.checkCode, mockUpdatedConfig)
  })

  test('the second check for a pupil is updated even if the first check is not found', async () => {
    const originalTTL = 300
    const pupilUUID = 'pupilUUID'
    const checkRef1 = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    const checkRef2 = {
      checkCode: 'checkCode2',
      pupilPin: '5678',
      schoolPin: 'abc12def'
    }
    const mockMergedConfig = {
      audibleSounds: false,
      checkTime: 30,
      colourContrast: true,
      colourContrastCode: 'YOB',
      compressCompletedCheck: true,
      fontSize: false,
      fontSizeCode: '',
      inputAssistance: false,
      loadingTime: 3,
      nextBetweenQuestions: false,
      numpadRemoval: false,
      practice: false,
      questionReader: false,
      questionTime: 6,
      speechSynthesis: false
    }
    jest.spyOn(dataServiceMock, 'getActiveCheckReferencesByPupilUuid').mockImplementation(async () => [checkRef1, checkRef2])

    jest.spyOn(redisServiceMock, 'ttl').mockImplementation(async () => originalTTL)

    jest.spyOn(redisServiceMock, 'get')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ checkCode: 'checkCode2' })

    jest.spyOn(mergeServiceMock, 'merge').mockResolvedValue(mockMergedConfig)
    await sut.process(pupilUUID)
    expect(redisServiceMock.setex).toHaveBeenCalledWith('preparedCheck:abc12def:5678', { checkCode: 'checkCode2', config: mockMergedConfig }, 300)
  })
})
