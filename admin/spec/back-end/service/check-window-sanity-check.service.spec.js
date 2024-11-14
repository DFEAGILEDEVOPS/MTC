
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkFormV2DataService = require('../../../services/data-access/check-form-v2.data.service')
const checkWindowSanityCheckService = require('../../../services/check-window-sanity-check.service')
const serviceManagerErrorMessages = require('../../../lib/errors/service-manager')
const testDeveloperErrorMessages = require('../../../lib/errors/test-developer')

const checkWindowMock = require('../mocks/check-window').legacy
const checkFormMock = require('../mocks/check-form')

describe('check-window-sanity-check.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns an error if there is no active checkwindow', async () => {
    jest.spyOn(checkWindowDataService, 'sqlFindOneCurrent').mockImplementation()
    jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType').mockImplementation()
    const isLiveCheck = true
    const error = await checkWindowSanityCheckService.check(isLiveCheck)
    expect(error).toBe(serviceManagerErrorMessages.noCurrentCheckWindow)
  })
  test('returns an error if there are no check forms assigned', async () => {
    jest.spyOn(checkWindowDataService, 'sqlFindOneCurrent').mockResolvedValue(checkWindowMock)
    jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType').mockImplementation()
    const isLiveCheck = true
    const error = await checkWindowSanityCheckService.check(isLiveCheck)
    expect(error).toBe(testDeveloperErrorMessages.noCheckFormsAssigned)
  })
  test('returns undefined if there is an active check window and check forms assigned', async () => {
    jest.spyOn(checkWindowDataService, 'sqlFindOneCurrent').mockResolvedValue(checkWindowMock)
    jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType').mockResolvedValue([checkFormMock])
    const isLiveCheck = true
    const result = await checkWindowSanityCheckService.check(isLiveCheck)
    expect(result).toBeUndefined()
  })
})
