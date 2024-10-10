import {
  PupilPrefsService,
  type IPupilPrefsDataService,
  type IPupilPreferenceDataUpdate,
  type IPupilPreferenceUpdate
} from './pupil-prefs.service'

const PupilPrefsDataServiceMock = jest.fn<IPupilPrefsDataService, any>(() => ({
  updatePupilPreferences: jest.fn(),
  getPupilUUIDByCheckCode: jest.fn(),
  closeDataService: jest.fn(),
  addInputAssistant: jest.fn()
}))

let sut: PupilPrefsService
let dataServiceMock: IPupilPrefsDataService

describe('pupil-prefs.service', () => {
  beforeEach(() => {
    dataServiceMock = new PupilPrefsDataServiceMock()
    sut = new PupilPrefsService(dataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('all updates should be sent in one call to data service', async () => {
    let dataUpdates: IPupilPreferenceDataUpdate[] = []
    jest.spyOn(dataServiceMock, 'updatePupilPreferences').mockImplementation(async (updates) => {
      dataUpdates = updates
      return Promise.resolve()
    })
    const update: IPupilPreferenceUpdate = {
      checkCode: 'check-code',
      preferences: {
        colourContrastCode: 'FTS',
        fontSizeCode: 'CCT'
      },
      version: 123
    }
    await sut.update(update)
    expect(dataServiceMock.updatePupilPreferences).toHaveBeenCalledTimes(1)
    expect(dataUpdates).toHaveLength(2)
  })

  test('colour contrast only update makes relevant data change', async () => {
    let dataUpdates: IPupilPreferenceDataUpdate[] = []
    jest.spyOn(dataServiceMock, 'updatePupilPreferences').mockImplementation(async (updates) => {
      dataUpdates = updates
      return Promise.resolve()
    })
    const update: IPupilPreferenceUpdate = {
      checkCode: 'check-code',
      preferences: {
        colourContrastCode: 'FTS'
      },
      version: 123
    }
    await sut.update(update)
    expect(dataServiceMock.updatePupilPreferences).toHaveBeenCalledTimes(1)
    expect(dataUpdates).toHaveLength(1)
    expect(dataUpdates[0].prefTable).toBe('[colourContrastLookUp]')
    expect(dataUpdates[0].prefField).toBe('colourContrastLookUp_Id')
  })

  test('font size only update makes relevant data change', async () => {
    let dataUpdates: IPupilPreferenceDataUpdate[] = []
    jest.spyOn(dataServiceMock, 'updatePupilPreferences').mockImplementation(async (updates) => {
      dataUpdates = updates
      return Promise.resolve()
    })
    const update: IPupilPreferenceUpdate = {
      checkCode: 'check-code',
      preferences: {
        fontSizeCode: 'CCT'
      },
      version: 123
    }
    await sut.update(update)
    expect(dataServiceMock.updatePupilPreferences).toHaveBeenCalledTimes(1)
    expect(dataUpdates).toHaveLength(1)
    expect(dataUpdates[0].prefTable).toBe('[fontSizeLookUp]')
    expect(dataUpdates[0].prefField).toBe('fontSizeLookUp_Id')
  })

  test('input assistant added when data is present', async () => {
    jest.spyOn(dataServiceMock, 'updatePupilPreferences')
    jest.spyOn(dataServiceMock, 'addInputAssistant')
    const prefUpdate: IPupilPreferenceUpdate = {
      checkCode: 'check-code',
      preferences: {},
      version: 123,
      inputAssistant: {
        firstName: 'first',
        lastName: 'last'
      }
    }
    await sut.update(prefUpdate)
    expect(dataServiceMock.updatePupilPreferences).not.toHaveBeenCalled()
    expect(dataServiceMock.addInputAssistant).toHaveBeenCalledTimes(1)
  })
})
