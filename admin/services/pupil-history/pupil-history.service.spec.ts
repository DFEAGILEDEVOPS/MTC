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
