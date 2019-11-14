import { PreparedCheckSyncService } from './prepared-check-sync.service'
import { IPreparedCheckMergeService } from './prepared-check-merge.service'
import { IPreparedCheckSyncDataService } from './prepared-check-sync.data.service'

let sut: PreparedCheckSyncService
let dataServiceMock: IPreparedCheckSyncDataService
let mergeServiceMock: IPreparedCheckMergeService

const PreparedCheckSyncDataServiceMock = jest.fn<IPreparedCheckSyncDataService, any>(() => ({
  getCurrentChecksByPupilUuid: jest.fn(),
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
    dataServiceMock.getCurrentChecksByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return []
    })

    try {
      await sut.process(pupilUUID)
      fail('error should have been thrown')
    } catch (error) {
      expect(dataServiceMock.getCurrentChecksByPupilUuid).toHaveBeenCalled()
      expect(error.message).toBe(`no checks found for pupil UUID:${pupilUUID}`)
    }
  })

  test('each active check is processed', async () => {
    const pupilUUID = 'pupilUUID'
    dataServiceMock.getCurrentChecksByPupilUuid = jest.fn(async (pupilUUID: string) => {
      return ['check1', 'check2']
    })
    await sut.process(pupilUUID)
    expect(mergeServiceMock.merge).toHaveBeenCalledTimes(2)
  })

  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('access arrangement codes are looked up in sql and error thrown if not found')
  test.todo('merged config is submitted back to redis')
})
