import AdmZip from 'adm-zip'
import moment from 'moment-timezone'
import { IJobData, JobDataService } from './data-access/job.data.service'
import { JobService as sut } from './job.service'

describe('Job Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getJobSummary', () => {
    test('returns array of jobs in expected format', async () => {
      const mockJobData: IJobData[] = [
        {
          createdAt: moment('2021-02-02 15:00'),
          jobId: 1,
          status: 'Complete',
          type: 'org import'
        },
        {
          createdAt: moment('2021-02-03 15:00'),
          jobId: 2,
          status: 'Failed',
          type: 'census import'
        }
      ]
      jest.spyOn(JobDataService, 'getJobs').mockResolvedValue(mockJobData)
      const output = await sut.getJobSummary()
      expect(output).toStrictEqual(mockJobData)
    })
  })

  describe('getJobOutputs', () => {
    test('returns job outputs as zip file', async () => {
      const expectedOutput = 'foo-output'
      const expectedErrors = 'bar-errors'
      jest.spyOn(JobDataService, 'getJobOutput').mockResolvedValue({
        output: expectedOutput,
        errorInfo: expectedErrors
      })
      const zippedBuffer = await sut.getJobOutputs(1)
      expect(JobDataService.getJobOutput).toHaveBeenCalledTimes(1)
      const zip = new AdmZip(zippedBuffer)
      const entries = zip.getEntries()
      expect(entries).toHaveLength(2)
      const zippedOutput = entries[1]
      expect(zip.readAsText(zippedOutput)).toBe(expectedOutput)
      const zippedErrors = entries[0]
      expect(zip.readAsText(zippedErrors)).toBe(expectedErrors)
    })
  })
})
