import moment from 'moment'
import { PupilHistoryDataService } from './pupil-history.data.service'
import sqlService from '../../data-access/sql.service'
describe('PupilHistoryDataService', () => {
  const mockDbCheck = {
    checkCode: '882C3E42-B8A8-4AA9-9289-BC16E9096DA1',
    checkForm_id: 2,
    checkWindow_id: 1,
    complete: false,
    completedAt: null,
    createdAt: moment(),
    createdBy_userId: 3,
    id: 42,
    inputAssistantAddedRetrospectively: false,
    isLiveCheck: true,
    processingFailed: false,
    pupil_id: 43,
    pupilLoginDate: null,
    received: false,
    receivedByServerAt: null,
    resultsSynchronised: false,
    updatedAt: moment()
  }

  beforeEach(() => {
    jest.spyOn(sqlService, 'query').mockImplementation()
    jest.spyOn(sqlService, 'modify').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#getChecks', () => {
    test('it checks the uuid passed in and throws if it isn\'t valid', async () => {
      await expect(PupilHistoryDataService.getChecks('invalid-uuid')).rejects.toThrow('UUID is not valid: invalid-uuid')
    })

    test('it returns a list of checks', async () => {
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue([mockDbCheck])
      const checks = await PupilHistoryDataService.getChecks('d6d98b88-c866-4496-9bd4-de7ba48d0f52')
      expect(checks).toHaveLength(1)
      expect(checks[0].complete).toBe(false)
      expect(checks[0].completedAt).toBeNull()
      expect(checks[0].pupilLoginDate).toBeNull()
      expect(checks[0].receivedByServerAt).toBeNull()
    })

    test('it preserves the recorded milestone timestamps', async () => {
      const createdAt = moment.utc('2026-10-20T09:00:00Z')
      const pupilLoginDate = moment.utc('2026-10-20T09:01:00Z')
      const receivedByServerAt = moment.utc('2026-10-20T09:05:00Z')
      const completedAt = moment.utc('2026-10-20T09:06:00Z')
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue([{
        ...mockDbCheck, createdAt, pupilLoginDate, receivedByServerAt, completedAt
      }])

      const checks = await PupilHistoryDataService.getChecks('d6d98b88-c866-4496-9bd4-de7ba48d0f52')

      expect(checks[0].createdAt.valueOf()).toBe(createdAt.valueOf())
      expect(checks[0].pupilLoginDate?.valueOf()).toBe(pupilLoginDate.valueOf())
      expect(checks[0].receivedByServerAt?.valueOf()).toBe(receivedByServerAt.valueOf())
      expect(checks[0].completedAt?.valueOf()).toBe(completedAt.valueOf())
    })
  })

  describe('#getRestarts', () => {
    test('it returns restart details including the user who recorded them', async () => {
      const createdAt = moment('2026-10-20T09:30:00Z')
      jest.spyOn(sqlService, 'readonlyQuery').mockResolvedValue([{
        id: 8,
        createdAt,
        updatedAt: createdAt,
        pupil_id: 43,
        description: 'IT issue',
        code: 'ITI',
        recordedByUser: 'Example User',
        checkId: 12,
        originCheck_id: 11
      }])

      const restarts = await PupilHistoryDataService.getRestarts('d6d98b88-c866-4496-9bd4-de7ba48d0f52')

      expect(restarts).toEqual([{
        id: 8,
        createdAt,
        updatedAt: createdAt,
        pupilId: 43,
        restartReason: 'IT issue',
        restartReasonCode: 'ITI',
        recordedByUser: 'Example User',
        checkId: 12,
        originCheckId: 11
      }])
      expect(sqlService.readonlyQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'), expect.any(Array))
    })
  })
})
