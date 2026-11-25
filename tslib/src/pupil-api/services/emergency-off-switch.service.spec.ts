import type { ISqlService } from '../../sql/sql.service.js'
import { EmergencyOffSwitchService } from './emergency-off-switch.service.js'

describe('EmergencyOffSwitchService', () => {
  test('reads the current switch state from SQL', async () => {
    const state = {
      isEnabled: true,
      updatedAt: new Date(),
      updatedBy_userId: 12
    }
    const sqlService: Pick<ISqlService, 'query'> = {
      query: jest.fn().mockResolvedValue([state])
    }
    const service = new EmergencyOffSwitchService(sqlService)

    await expect(service.getState()).resolves.toStrictEqual(state)
    expect(sqlService.query).toHaveBeenCalledWith(expect.stringContaining('[mtc_admin].[emergencyOffSwitch]'))
  })

  test('throws if the switch state row is missing', async () => {
    const sqlService: Pick<ISqlService, 'query'> = {
      query: jest.fn().mockResolvedValue([])
    }
    const service = new EmergencyOffSwitchService(sqlService)

    await expect(service.getState()).rejects.toThrow('Emergency off-switch state has not been initialized')
  })
})
