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
    })
  })
})
