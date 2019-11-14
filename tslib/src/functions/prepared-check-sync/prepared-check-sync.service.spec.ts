
let sut: PreparedCheckSyncService
let dataServiceMock: IPreparedCheckSyncDataService
const PreparedCheckSyncDataServiceMock = jest.fn<IPreparedCheckSyncDataService, any>(() => ({
  getCurrentChecksByPupilUuid: jest.fn(),
  getAccessArrangementsCodesById: jest.fn(),
  getAccessArrangementsByCheckCode: jest.fn()
}))

describe('prepared-check-sync.service', () => {

  beforeEach(() => {
    dataServiceMock = new PreparedCheckSyncDataServiceMock()
    sut = new PreparedCheckSyncService(dataServiceMock)
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

  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('merged config is submitted back to redis')
})

export class PreparedCheckSyncService {

  private dataService: IPreparedCheckSyncDataService

  constructor (dataService?: IPreparedCheckSyncDataService) {
    if (dataService === undefined) {
      dataService = new PreparedCheckSyncDataService()
    }
    this.dataService = dataService
  }
  async process (pupilUUID: string): Promise<void> {
    const checksToUpdate = await this.dataService.getCurrentChecksByPupilUuid(pupilUUID)
    if (checksToUpdate.length === 0) {
      throw new Error(`no checks found for pupil UUID:${pupilUUID}`)
    }
  }
}

export interface IPreparedCheckSyncDataService {
  getCurrentChecksByPupilUuid (pupilUUID: string): Promise<Array<string>>
  getAccessArrangementsCodesById (aaIds: Array<number>): Promise<Array<string>>
  getAccessArrangementsByCheckCode (checkCode: string): Promise<any>
}

export class PreparedCheckSyncDataService implements IPreparedCheckSyncDataService {
  getCurrentChecksByPupilUuid (pupilUUID: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  getAccessArrangementsCodesById (aaIds: number[]): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  getAccessArrangementsByCheckCode (checkCode: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
}

export interface IPreparedCheckSyncMessage {
  version: number
  pupilUUID: string
}
