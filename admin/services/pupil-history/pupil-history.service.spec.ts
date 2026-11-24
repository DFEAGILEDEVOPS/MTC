import moment from 'moment-timezone'
import { PupilHistoryDataService } from './data-access/pupil-history.data.service'
import { type IPupilHistory, PupilHistoryService } from './pupil-history-service'
const R = require('ramda')

const mockPupilHistoryDefault: IPupilHistory = {
  meta: {
    restartsTakenCount: 0
  },
  school: {
    dfeNumber: 12345,
    estabCode: 123,
    leaCode: 45,
    id: 12,
    name: 'school',
    pin: null,
    pinExpiresAt: null,
    urlSlug: 'x',
    urn: 12345
  },
  restarts: [],
  pupil: {
    attendanceId: null,
    checkComplete: false,
    createdAt: moment('2022-01-02'),
    currentCheckId: 1,
    dateOfBirth: moment('2015-01-01'),
    foreName: 'a',
    foreNameAlias: null,
    gender: 'F',
    id: 1,
    isDiscretionaryRestartAvailable: false,
    lastName: 'B',
    lastNameAlias: null,
    middleNames: '',
    restartAvailable: false,
    upn: 'sdkfjsdkfjsd',
    urlSlug: 'xyz'
  },
  checks: [
    {
      id: 1,
      complete: true,
      createdAt: moment('2022-01-26T08:55:00'),
      completedAt: moment('2022-01-26T09:06:00'),
      pupilLoginDate: moment('2022-01-26T09:00:00'),
      receivedByServerAt: moment('2022-01-26T09:05:00'),
      received: true,
      processingFailed: false,
      checkCode: 'sdfdsfhdsjkfhk',
      isLiveCheck: true,
      events: []
    }
  ]
}

describe('PupilHistoryService', () => {
  let pupilHistoryMock: IPupilHistory
  beforeEach(() => {
    pupilHistoryMock = R.clone(mockPupilHistoryDefault)
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  const mockPupilUuid = '2d455411-cc32-4e04-bcbc-36d76e364320'

  const mockRestart = {
    id: 8,
    pupilId: 1,
    createdAt: moment('2022-01-26T09:10:00'),
    updatedAt: moment('2022-01-26T09:15:00'),
    restartReason: 'IT issue',
    restartReasonCode: 'ITI',
    recordedByRole: 'TEACHER',
    checkId: 2,
    originCheckId: 1,
    isDeleted: false,
    deletedAt: null,
    deletedByRole: 'Unknown'
  }

  test('it combines all check milestones and restarts newest first, retaining current status and active values', async () => {
    pupilHistoryMock.restarts = [mockRestart]
    pupilHistoryMock.checks.push({
      ...pupilHistoryMock.checks[0],
      id: 2,
      isLiveCheck: false,
      complete: false,
      received: false,
      pupilLoginDate: null,
      receivedByServerAt: null,
      completedAt: null
    })
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)

    const timeline = await PupilHistoryService.getTimeline(mockPupilUuid)

    expect(timeline.map(event => event.action)).toEqual([
      'Restart', 'Check complete', 'Check received', 'Logged in', 'Pin generated', 'Pin generated'
    ])
    const officialEvents = timeline.filter(event => event.check?.id === 1)
    expect(officialEvents).toHaveLength(4)
    officialEvents.forEach(event => {
      expect(event.check).toMatchObject({ active: true, checkStatus: 'Check complete', isLiveCheck: true })
    })
    expect(timeline[5].check).toMatchObject({ active: false, checkStatus: 'Pin generated', isLiveCheck: false })
    expect(PupilHistoryDataService.getPupilHistory).toHaveBeenCalledTimes(1)
  })

  test('it retains a removed restart and adds a separate removal event without counting it as a restart taken', async () => {
    const removedRestart = {
      ...mockRestart,
      isDeleted: true,
      deletedAt: moment('2022-01-26T09:15:00'),
      deletedByRole: 'STA-ADMIN'
    }
    pupilHistoryMock.restarts = [mockRestart, removedRestart]
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)

    const history = await PupilHistoryService.getHistory(mockPupilUuid)
    const timeline = PupilHistoryService.buildTimeline(history)

    expect(history.meta.restartsTakenCount).toBe(1)
    expect(timeline.filter(event => event.action === 'Restart')).toHaveLength(2)
    expect(timeline[0]).toEqual({
      action: 'Restart removed',
      occurredAt: removedRestart.deletedAt,
      restart: removedRestart
    })
    expect(timeline).toHaveLength(7)
  })

  test('it returns an empty timeline when there are no checks or restarts', () => {
    expect(PupilHistoryService.buildTimeline({ ...pupilHistoryMock, checks: [] })).toEqual([])
  })

  test('it retains all recorded milestones when the check is complete', async () => {
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)

    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)

    expect(pupilHistory.checks[0].checkStatus).toBe('Check complete')
    expect(pupilHistory.checks[0].events).toEqual([
      { label: 'PIN generated', occurredAt: pupilHistoryMock.checks[0].createdAt },
      { label: 'Pupil logged in', occurredAt: pupilHistoryMock.checks[0].pupilLoginDate },
      { label: 'Check received by server', occurredAt: pupilHistoryMock.checks[0].receivedByServerAt },
      { label: 'Check processing completed', occurredAt: pupilHistoryMock.checks[0].completedAt }
    ])
    expect(pupilHistoryMock.checks[0].events).toEqual([])
  })

  test('it omits milestones without valid timestamps, even when completion is flagged', async () => {
    pupilHistoryMock.checks[0].pupilLoginDate = null
    pupilHistoryMock.checks[0].receivedByServerAt = moment.invalid()
    pupilHistoryMock.checks[0].completedAt = null
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)

    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)

    expect(pupilHistory.checks[0].events).toEqual([
      { label: 'PIN generated', occurredAt: pupilHistoryMock.checks[0].createdAt }
    ])
  })

  test('it orders milestones by their recorded timestamps', async () => {
    pupilHistoryMock.checks[0].receivedByServerAt = moment('2022-01-26T09:07:00')
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)

    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)

    expect(pupilHistory.checks[0].events.map(event => event.label)).toEqual([
      'PIN generated', 'Pupil logged in', 'Check processing completed', 'Check received by server'
    ])
  })

  test('it fails to "Pin generated" check status', async () => {
    pupilHistoryMock.checks[0].complete = false
    pupilHistoryMock.checks[0].pupilLoginDate = null
    pupilHistoryMock.checks[0].received = false

    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Pin generated')
  })

  test('it computes the "Check complete" check status', async () => {
    pupilHistoryMock.checks[0].complete = true
    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Check complete')
  })

  test('it computes the "Received data error" check status', async () => {
    pupilHistoryMock.checks[0].complete = false
    pupilHistoryMock.checks[0].received = true
    pupilHistoryMock.checks[0].processingFailed = true

    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Received data error')
  })

  test('it computes the "Logged in" check status', async () => {
    pupilHistoryMock.checks[0].complete = false
    pupilHistoryMock.checks[0].received = false
    pupilHistoryMock.checks[0].processingFailed = false

    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Logged in')
  })

  test('it computes the "Check received" check status', async () => {
    pupilHistoryMock.checks[0].complete = false
    pupilHistoryMock.checks[0].received = true
    pupilHistoryMock.checks[0].processingFailed = false

    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Check received')
  })

  test('it computes the Check complete check status', async () => {
    pupilHistoryMock.checks[0].complete = true
    pupilHistoryMock.checks[0].received = true
    pupilHistoryMock.checks[0].processingFailed = false

    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('Check complete')
  })

  test('it fails to "n/a" check status', async () => {
    pupilHistoryMock.checks[0].complete = false
    pupilHistoryMock.checks[0].received = false
    pupilHistoryMock.checks[0].processingFailed = null

    jest.spyOn(PupilHistoryDataService, 'getPupilHistory').mockResolvedValue(pupilHistoryMock)
    const pupilHistory = await PupilHistoryService.getHistory(mockPupilUuid)
    expect(pupilHistory.checks[0].checkStatus).toBe('n/a')
  })
})
