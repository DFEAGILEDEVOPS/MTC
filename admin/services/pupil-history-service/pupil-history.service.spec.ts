
import moment from 'moment-timezone'
import { PupilHistoryDataService } from './data-access/pupil-history.data.service'
import { IPupilHistory, PupilHistoryService } from './pupil-history-service'

describe('PupilHistoryService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  const mockPupilUuid = '2d455411-cc32-4e04-bcbc-36d76e364320'

  test('it fails to "Pin generated" check status', async () => {
    const mock = {
      school: {},
      restarts: [],
      pupil: {},
      checks: [
        { id: 1, complete: false, pupilLoginDate: null, received: false, processingFailed: false }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock as IPupilHistory)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Pin generated')
  })

  test('it computes the "Check complete" check status', async () => {
    const mock = {
      school: {},
      restarts: [],
      pupil: {},
      checks: [
        { id: 1, complete: true }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock as IPupilHistory)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Check complete')
  })

  test('it computes the "Received data error" check status', async () => {
    const mock = {
      school: {},
      restarts: [],
      pupil: {},
      checks: [
        { id: 1, complete: false, pupilLoginDate: moment('2022-01-26T09:00:00'), received: true, processingFailed: true }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock as IPupilHistory)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Received data error')
  })

  test('it computes the "Logged in" check status', async () => {
    const mock = {
      school: {},
      restarts: [],
      pupil: {},
      checks: [
        { id: 1, complete: false, pupilLoginDate: moment('2022-01-26T09:00:00'), received: false, processingFailed: false }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock as IPupilHistory)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Logged in')
  })

  test('it computes the "Check received" check status', async () => {
    const mock = {
      school: {},
      restarts: [],
      pupil: {},
      checks: [
        { id: 1, complete: false, pupilLoginDate: moment('2022-01-26T09:00:00'), received: true, processingFailed: false }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock as IPupilHistory)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Check received')
  })

  test('it computes the Check complete check status', async () => {
    const mock = {
      school: {},
      restarts: [],
      pupil: {},
      checks: [
        { id: 1, complete: true, pupilLoginDate: moment('2022-01-26T09:00:00'), received: true, processingFailed: false }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock as IPupilHistory)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Check complete')
  })

  test('it fails to "n/a" check status', async () => {
    const mock: IPupilHistory = {
      school: null,
      restarts: [],
      pupil: null,
      meta: {
        restartTakenCount: 0
      },
      checks: [
        {
          id: 1,
          complete: false,
          pupilLoginDate: null,
          received: false,
          processingFailed: null,
          checkCode: 'x',
          isLiveCheck: true,
          checkStatus: null
        }
      ]
    }
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(mock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('n/a')
  })
})
