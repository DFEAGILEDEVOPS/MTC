import { PreparedCheckMergeService, type ICheckConfig, type IPreparedCheckMergeDataService } from './prepared-check-merge.service'

let sut: PreparedCheckMergeService
let dataServiceMock: IPreparedCheckMergeDataService

const PreparedCheckMergeDataServiceMock = jest.fn<IPreparedCheckMergeDataService, any>(() => ({
  getAccessArrangementsCodesByIds: jest.fn()
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

const checkConfig: ICheckConfig = {
  questionTime: 5,
  loadingTime: 5,
  speechSynthesis: false,
  practice: true,
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
    dataServiceMock = new PreparedCheckMergeDataServiceMock()
    sut = new PreparedCheckMergeService(dataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('if no new AA config passed in, defaults are returned', async () => {
    checkConfig.colourContrast = true
    checkConfig.fontSize = true
    const actualConfig = await sut.merge(checkConfig, [])
    expect(actualConfig.colourContrast).toBe(false)
    expect(actualConfig.fontSize).toBe(false)
  })

  test('creates a new config based on the new aa settings and the config supplied', async () => {
    jest.spyOn(dataServiceMock, 'getAccessArrangementsCodesByIds').mockImplementation(async () => {
      return ['FTS', 'CCT']
    })
    const config = await sut.merge(checkConfig, pupilAccessArrangements)
    expect(dataServiceMock.getAccessArrangementsCodesByIds).toHaveBeenCalledWith(expect.any(Array))
    expect(config.fontSize).toBe(true)
    expect(config.fontSizeCode).toBe('RGL')
    expect(config.colourContrast).toBe(true)
    expect(config.colourContrastCode).toBe('BOW')
  })
})
