import { CheckWindowPhaseService } from './check-window-phase.service'
import * as checkWindowMocks from '../../spec/back-end/mocks/check-window'
import * as checkWindowPhaseConsts from '../../lib/consts/check-window-phase'
const checkWindowService = require('../check-window-v2.service')
const settingsService = require('../setting.service')
const sut = CheckWindowPhaseService

describe('CheckWindowPhaseService', () => {
  test('pre admin start: before the admin start date the check window is unavailble', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.beforeAdminStartDate)
    jest.spyOn(settingsService, 'get').mockImplementation()
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.unavailable)
  })

  test('pre tryItOut: after the admin start date and before the tio starts', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.preStart)
    jest.spyOn(settingsService, 'get').mockImplementation()
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.preStart)
  })

  test('tryItOut: after the try it out start date and before the official check starts', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.familiarisationCheckWindow)
    jest.spyOn(settingsService, 'get').mockImplementation()
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.tryItOut)
  })

  test('official: after the official check start date and before the official check ends', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.liveCheckWindow)
    jest.spyOn(settingsService, 'get').mockImplementation()
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.officialCheck)
  })

  test('postCheckAdmin: after the official check start date and before the official check ends', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.postLiveCheckWindow)
    jest.spyOn(settingsService, 'get').mockImplementation()
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.postCheckAdmin)
  })

  test('readOnlyAdmin: after the official check end date with read only settings', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.readOnlyAdminOrUnavailable)
    jest.spyOn(settingsService, 'get').mockResolvedValue({
      isPostAdminEndDateUnavailable: false
    })
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.readOnlyAdmin)
  })

  test('Unavailable: after the official check end date with unavailable settings', async () => {
    jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.readOnlyAdminOrUnavailable)
    jest.spyOn(settingsService, 'get').mockResolvedValue({
      isPostAdminEndDateUnavailable: true
    })
    const phase = await sut.getPhase()
    expect(phase).toBe(checkWindowPhaseConsts.unavailable)
  })
})
