import { IUserInfoData, PsReportExecDataService } from './ps-report-exec.data.service'
import { PsReportExecService as sut } from './ps-report-exec.service'

describe('PS Report Exec Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('requestReportGeneration', () => {
    test('throws if user id less than 1', async () => {
      await expect(sut.requestReportGeneration(-1)).rejects.toThrow('currentUserId must be greater than zero')
    })

    test('creates message including users name', async () => {
      const userId = 123
      const userInfoData: IUserInfoData = {
        displayName: 'John Smith',
        identifier: 'jsmith@xyz.com'
      }
      jest.spyOn(PsReportExecDataService, 'sendPsReportExecMessage').mockImplementation()
      jest.spyOn(PsReportExecDataService, 'getUserInfo').mockResolvedValue(userInfoData)
      await sut.requestReportGeneration(userId)
      expect(PsReportExecDataService.getUserInfo).toHaveBeenCalledWith(userId)
    })
    test.todo('creates job and passes over user id')
  })
})
