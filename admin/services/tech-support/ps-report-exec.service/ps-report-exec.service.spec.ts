import { PsReportExecDataService } from './ps-report-exec.data.service'
import { PsReportExecService as sut } from './ps-report-exec.service'

describe('PS Report Exec Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('requestReportGeneration', () => {
    test('throws if user id less than 1', async () => {
      await expect(sut.requestReportGeneration(-1)).rejects.toThrow('currentUserId must be a non negative number')
    })

    test('creates message including users name', async () => {
      
      jest.spyOn(PsReportExecDataService, 'sendPsReportExecMessage').mockImplementation()
      jest.spyOn(PsReportExecDataService, 'getUsersName').mockResolvedValue()
    })
    test.todo('creates job and passes over user id')
  })
})
