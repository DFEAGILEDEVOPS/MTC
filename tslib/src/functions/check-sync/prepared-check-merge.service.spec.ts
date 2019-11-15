import { PreparedCheckMergeService, IPreparedCheck } from './prepared-check-merge.service'
import { IPreparedCheckSyncDataService } from './prepared-check-sync.data.service'

let sut: PreparedCheckMergeService
let dataServiceMock: IPreparedCheckSyncDataService

const PreparedCheckSyncDataServiceMock = jest.fn<IPreparedCheckSyncDataService, any>(() => ({
  getActiveCheckReferencesByPupilUuid: jest.fn(),
  getAccessArrangementsCodesByIds: jest.fn(),
  getAccessArrangementsByCheckCode: jest.fn()
}))

const aaConfig = {
  audibleSounds: false,
  inputAssistance: false,
  numpadRemoval: false,
  fontSize: false,
  colourContrast: false,
  questionReader: false,
  nextBetweenQuestions: false
}

const preparedCheck: IPreparedCheck = {
  schoolPin: 'abc12def',
  pupilPin: 1234,
  checkCode: 'check-code',
  questionTime: 5,
  loadingTime: 5,
  speechSynthesis: false,
  ...aaConfig
}

const pupilAccessArrangements = [
  {
    accessArrangements_id: 3,
    pupilFontSizeCode: 'RGL',
    pupilColourContrastCode: null
  },
  {
    accessArrangements_id: 4,
    pupilFontSizeCode: null,
    pupilColourContrastCode: 'BOW'
  }
]

describe('prepared-check-merge.service', () => {

  beforeEach(() => {
    dataServiceMock = new PreparedCheckSyncDataServiceMock()
    sut = new PreparedCheckMergeService(dataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('access arrangements are looked up in sql and error thrown if not found', async () => {
    dataServiceMock.getAccessArrangementsByCheckCode = jest.fn(async (checkCode: string) => {
      return []
    })
    try {
      await sut.merge(preparedCheck)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe(`no access arrangements found by checkCode:${preparedCheck.checkCode}`)
    }
  })

  test('access arrangement codes are looked up in sql and error thrown if not found', async () => {
    dataServiceMock.getAccessArrangementsByCheckCode = jest.fn(async (checkCode: string) => {
      return [aaConfig]
    })
    dataServiceMock.getAccessArrangementsCodesByIds = jest.fn(async (newAaIds: number[]) => {
      return []
    })
    try {
      await sut.merge(preparedCheck)
      fail('error should have been thrown')
    } catch (error) {
      expect(error.message).toBe('no access arrangement codes found')
    }
  })

  test.skip('creates a new config based on the new aa settings and the config supplied', async () => {
    dataServiceMock.getAccessArrangementsCodesByIds = jest.fn(async (ids: number[]) => {
      return ['FTS', 'CCT']
    })
    dataServiceMock.getAccessArrangementsByCheckCode = jest.fn(async (checkCode: string) => {
      return pupilAccessArrangements
    })
    const config = await sut.merge(preparedCheck)
    expect(dataServiceMock.getAccessArrangementsCodesByIds).toHaveBeenCalled()
    expect(config.fontSize).toBeTruthy()
    expect(config.fontSizeCode).toBe('RGL')
    expect(config.colourContrast).toBeTruthy()
    expect(config.colourContrastCode).toBe('BOW')
  })
})
