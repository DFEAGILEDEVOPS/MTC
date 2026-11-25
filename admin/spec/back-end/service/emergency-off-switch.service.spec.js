jest.mock('../../../services/data-access/emergency-off-switch.data.service', () => ({
  sqlFindOne: jest.fn(),
  sqlUpdate: jest.fn()
}))

const emergencyOffSwitchDataService = require('../../../services/data-access/emergency-off-switch.data.service')
const emergencyOffSwitchService = require('../../../services/emergency-off-switch.service')

describe('emergencyOffSwitchService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns the persisted switch state', async () => {
    const state = { isEnabled: true, updatedBy_userId: 12 }
    emergencyOffSwitchDataService.sqlFindOne.mockResolvedValue(state)

    await expect(emergencyOffSwitchService.get()).resolves.toBe(state)
  })

  test('fails explicitly when the state row is missing', async () => {
    emergencyOffSwitchDataService.sqlFindOne.mockResolvedValue(undefined)

    await expect(emergencyOffSwitchService.get()).rejects.toThrow('Emergency off-switch state has not been initialized')
  })

  test('records an update with a valid user ID', async () => {
    emergencyOffSwitchDataService.sqlUpdate.mockResolvedValue({})

    await emergencyOffSwitchService.update(true, 12)

    expect(emergencyOffSwitchDataService.sqlUpdate).toHaveBeenCalledWith(true, 12)
  })

  test('rejects invalid switch values and user IDs', async () => {
    await expect(emergencyOffSwitchService.update('on', 12)).rejects.toThrow(TypeError)
    await expect(emergencyOffSwitchService.update(true, undefined)).rejects.toThrow(TypeError)
    expect(emergencyOffSwitchDataService.sqlUpdate).not.toHaveBeenCalled()
  })
})
