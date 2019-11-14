import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { IPreparedCheckMergeService, IPreparedCheck } from './prepared-check-merge.service'
import { IPreparedCheckSyncDataService, IActiveCheckReference } from './prepared-check-sync.data.service'
import { IRedisService } from '../../caching/redis-service'
import { RedisServiceMock } from '../../caching/redis-service.mock'

let sut: PreparedCheckSyncService
let dataServiceMock: IPreparedCheckSyncDataService
let mergeServiceMock: IPreparedCheckMergeService
let redisServiceMock: IRedisService

const PreparedCheckSyncDataServiceMock = jest.fn<IPreparedCheckSyncDataService, any>(() => ({
  getActiveCheckReferencesByPupilUuid: jest.fn(),
  getAccessArrangementsCodesById: jest.fn(),
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

  test('active checks for pupil are looked up in redis and error thrown if none found', async () => {
    const pupilUUID = 'pupilUUID'
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return []
    })

    try {
      await sut.process(pupilUUID)
      fail('error should have been thrown')
    } catch (error) {
      expect(dataServiceMock.getActiveCheckReferencesByPupilUuid).toHaveBeenCalled()
      expect(error.message).toBe(`no checks found for pupil UUID:${pupilUUID}`)
    }
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
    await sut.process(pupilUUID)
    expect(mergeServiceMock.merge).toHaveBeenCalledTimes(3)
  })

  test('merged config is submitted back to redis with TTL preserved', async () => {
    const pupilUUID = 'pupilUUID'
    const activeCheckReference = {
      checkCode: 'checkCode',
      pupilPin: '1234',
      schoolPin: 'abc12def'
    }
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return [activeCheckReference]
    })

    const preparedCheck: IPreparedCheck = {
      pupilPin: 1234,
      schoolPin: 'abc34def'
    }
    mergeServiceMock.merge = jest.fn(async (preparedCheck: any) => {
      return preparedCheck
    })

    await sut.process(pupilUUID)
    expect(redisServiceMock.setex).toHaveBeenCalledWith(preparedCheck)
  })

  test.todo('TTL of preparedCheck is preserved')
})

describe('prepared-check-merge.service', () => {
  test.todo('updated and merged prepared checks are persisted back to redis')
  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('access arrangement codes are looked up in sql and error thrown if not found')
})
