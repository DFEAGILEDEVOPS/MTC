import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { IPreparedCheckMergeService } from './prepared-check-merge.service'
import { IPreparedCheckSyncDataService, IActiveCheckReference } from './prepared-check-sync.data.service'

let sut: PreparedCheckSyncService
let dataServiceMock: IPreparedCheckSyncDataService
let mergeServiceMock: IPreparedCheckMergeService

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
    dataServiceMock = new PreparedCheckSyncDataServiceMock()
    mergeServiceMock = new PreparedCheckMergeServiceMock()
    sut = new PreparedCheckSyncService(dataServiceMock, mergeServiceMock)
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

  test('merged config is submitted back to redis', async () => {
    const pupilUUID = 'pupilUUID'
    dataServiceMock.getActiveCheckReferencesByPupilUuid = jest.fn(async (pupilUUID: string) => {
      const refs: Array<IActiveCheckReference> = [
        {
          checkCode: 'checkCode',
          pupilPin: '1234',
          schoolPin: 'abc12def'
        }
      ]
      return refs
    })
    await sut.process(pupilUUID)
    expect(redisServiceMock.setex).toHaveBeenCalled()
  })
})

describe('prepared-check-merge.service', () => {
  test.todo('updated and merged prepared checks are persisted back to redis')
  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('access arrangement codes are looked up in sql and error thrown if not found')
})
