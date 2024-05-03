import { JobService, JobStatus, JobType } from '../../job/job.service'
import { type IExecPsReportRequest, type IUserInfoData, PsReportExecDataService } from './ps-report-exec.data.service'
import { PsReportExecService as sut } from './ps-report-exec.service'
import moment from 'moment-timezone'
const dateService = require('../../date.service')

describe('PS Report Exec Service', () => {
  const userId = 123
  const userInfoData: IUserInfoData = {
    displayName: 'John Smith',
    identifier: 'jsmith@xyz.com'
  }
  const createdJobUuid = '7b20429d-b9bb-4e9d-bd4d-58090e1b49dd'
  const currentDateTimeMock = moment('2022-11-10 15:30')

  beforeEach(() => {
    jest.spyOn(PsReportExecDataService, 'sendPsReportExecMessage').mockImplementation()
    jest.spyOn(dateService, 'utcNowAsMoment').mockReturnValue(currentDateTimeMock)
    jest.spyOn(PsReportExecDataService, 'getUserInfo').mockResolvedValue(userInfoData)
    jest.spyOn(JobService, 'createJob').mockResolvedValue({
      jobUuid: createdJobUuid
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('requestReportGeneration', () => {
    test('throws if user id less than 1', async () => {
      await expect(sut.requestReportGeneration(-1)).rejects.toThrow('currentUserId must be greater than zero')
    })

    test('does not throw if single urn provided', async () => {
      await expect(sut.requestReportGeneration(123, 'abc')).resolves.not.toThrow()
    })

    test('does not throw if multiple valid urns provided', async () => {
      await expect(sut.requestReportGeneration(123, '1,2,3')).resolves.not.toThrow()
    })

    test('does not throw if spaces are included', async () => {
      await expect(sut.requestReportGeneration(123, '12345, 2245,34534,4345345 ,545454')).resolves.not.toThrow()
    })

    test('throws if invalid urn provided amongst valid URNs', async () => {
      await expect(sut.requestReportGeneration(123, '1,abc,2,3')).rejects.toThrow('Invalid URN: abc')
    })

    test('creates job and sends message', async () => {
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
