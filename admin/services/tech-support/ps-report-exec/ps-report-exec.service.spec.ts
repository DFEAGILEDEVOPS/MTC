import { JobService, JobStatus, JobType } from '../../job-service/job.service'
import { IExecPsReportRequest, IUserInfoData, PsReportExecDataService } from './ps-report-exec.data.service'
import { PsReportExecService as sut } from './ps-report-exec.service'
import moment from 'moment-timezone'
const dateService = require('../../date.service')

describe('PS Report Exec Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('requestReportGeneration', () => {
    test('throws if user id less than 1', async () => {
      await expect(sut.requestReportGeneration(-1)).rejects.toThrow('currentUserId must be greater than zero')
    })

    test('creates job and sends message', async () => {
      const userId = 123
      const userInfoData: IUserInfoData = {
        displayName: 'John Smith',
        identifier: 'jsmith@xyz.com'
      }
      jest.spyOn(PsReportExecDataService, 'sendPsReportExecMessage').mockImplementation()
      const currentDateTimeMock = moment('2022-11-10 15:30')
      jest.spyOn(dateService, 'utcNowAsMoment').mockReturnValue(currentDateTimeMock)
      jest.spyOn(PsReportExecDataService, 'getUserInfo').mockResolvedValue(userInfoData)
      jest.spyOn(JobService, 'createJob').mockResolvedValue({
        jobUuid: 'xyz'
      })
      const expectedRequestorDetails = `${userInfoData.displayName} (${userInfoData.identifier})`
      // TODO spy on job service and use job uuid
      await sut.requestReportGeneration(userId)
      expect(PsReportExecDataService.getUserInfo).toHaveBeenCalledWith(userId)
      // TODO assert that message was sent including job uuid and user info...
      const expectedMessage: IExecPsReportRequest = {
        dateTimeRequested: currentDateTimeMock,
        jobUuid: 'xyz',
        requestedBy: expectedRequestorDetails
      }
      expect(JobService.createJob).toHaveBeenCalledWith(
        expectedRequestorDetails, JobType.PsychometricianReport, JobStatus.Submitted)
      expect(PsReportExecDataService.sendPsReportExecMessage).toHaveBeenCalledWith(expectedMessage)
    })
    test.todo('creates job and passes over user id')
  })
})
