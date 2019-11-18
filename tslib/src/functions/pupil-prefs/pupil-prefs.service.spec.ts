
import {
  PupilPrefsService,
  IPupilPrefsDataService,
  IPupilPreferenceDataUpdate,
  IPupilPreferenceUpdate
} from './pupil-prefs.service'

const PupilPrefsDataServiceMock = jest.fn<IPupilPrefsDataService, any>(() => ({
  updatePupilPreferences: jest.fn()
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
    let dataUpdates: Array<IPupilPreferenceDataUpdate> = []
    dataServiceMock.updatePupilPreferences = jest.fn((updates) => {
      dataUpdates = updates
      return Promise.resolve()
    })
    const update: IPupilPreferenceUpdate = {
      accessArrangementCode: 'AB1',
      checkCode: 'check-code',
      preferenceCode: 'CD1',
      preferences: {
        colourContrastCode: 'FTS',
        fontSizeCode: 'CCT'
      }
    }
    await sut.update(update)
    expect(dataServiceMock.updatePupilPreferences).toHaveBeenCalledTimes(1)
    expect(dataUpdates.length).toBe(2)
  })

  test('infer table updates from batch inputs', async () => {

    const update: IPupilPreferenceUpdate = {
      accessArrangementCode: 'AB1',
      checkCode: 'check-code',
      preferenceCode: 'CD1',
      preferences: {}
    }
    await sut.update(update)
  })
  test.todo('infer field updates from batch inputs')
})
