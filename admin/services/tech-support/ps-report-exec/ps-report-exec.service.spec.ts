import { JobService, JobStatus, JobType } from '../../job-service/job.service'
import { type IExecPsReportRequest, type IUserInfoData, PsReportExecDataService } from './ps-report-exec.data.service'
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
      const createdJobUuid = '7b20429d-b9bb-4e9d-bd4d-58090e1b49dd'
      jest.spyOn(PsReportExecDataService, 'sendPsReportExecMessage').mockImplementation()
      const currentDateTimeMock = moment('2022-11-10 15:30')
      jest.spyOn(dateService, 'utcNowAsMoment').mockReturnValue(currentDateTimeMock)
      jest.spyOn(PsReportExecDataService, 'getUserInfo').mockResolvedValue(userInfoData)
      jest.spyOn(JobService, 'createJob').mockResolvedValue({
        jobUuid: createdJobUuid
      })
      const expectedRequestorDetails = `${userInfoData.displayName} (${userInfoData.identifier})`
      await sut.requestReportGeneration(userId)
      expect(PsReportExecDataService.getUserInfo).toHaveBeenCalledWith(userId)
      const expectedMessage: IExecPsReportRequest = {
        dateTimeRequested: currentDateTimeMock,
        jobUuid: createdJobUuid,
        requestedBy: expectedRequestorDetails
      }
      expect(JobService.createJob).toHaveBeenCalledWith(
        `requested by ${expectedRequestorDetails}`, JobType.PsychometricianReport, JobStatus.Submitted)
      expect(PsReportExecDataService.sendPsReportExecMessage).toHaveBeenCalledWith(expectedMessage)
    })
  })
})
