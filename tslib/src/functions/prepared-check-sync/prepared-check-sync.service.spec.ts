
let sut: PreparedCheckSyncService

describe('prepared-check-sync.service', () => {

  beforeEach(() => {
    sut = new PreparedCheckSyncService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('prepared check is looked up in redis and error thrown if not found', async () => {
    
  })

  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('access arrangements are looked up in sql and error thrown if not found')
  test.todo('merged config is submitted back to redis')
})

export class PreparedCheckSyncService {
  async process (): Promise<void> {
    throw new Error('not implemented')
  }
}

export interface IPreparedCheckSyncDataService {
  getCurrentChecksByPupilUuid (pupilUUID: string): Promise<Array<string>>
  getAccessArrangementsCodesById (aaIds: Array<number>): Promise<Array<string>>
  getAccessArrangementsByCheckCode (checkCode: string): Promise<any>
}

export interface IPreparedCheckSyncMessage {
  version: number
  pupilUUID: string
}
