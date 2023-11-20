import AdmZip from 'adm-zip'
import moment from 'moment-timezone'
import { type IJobData, JobDataService } from './data-access/job.data.service'
import { JobService as sut } from './job.service'
const dateService = require('../date.service')

describe('Job Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getJobSummary', () => {
    test('returns array of jobs in expected format', async () => {
      const mockJobData: IJobData[] = [
        {
          createdAt: moment('2021-02-02 15:00'),
          urlSlug: '1d822a3c-7a25-4613-84c2-5d1344ac45a0',
          status: 'Complete',
          type: 'org import'
        },
        {
          createdAt: moment('2021-02-03 15:00'),
          urlSlug: '67663f0e-e375-40ef-aa81-2b617c1678ad',
          status: 'Failed',
          type: 'census import'
        }
      ]
      jest.spyOn(JobDataService, 'getJobs').mockResolvedValue(mockJobData)
      const output = await sut.getJobSummary()
      const expectedOutput = mockJobData.map(o => {
        return {
          createdAt: dateService.formatDateAndTime(o.createdAt),
          urlSlug: o.urlSlug,
          status: o.status,
          type: o.type
        }
      })
      expect(output).toStrictEqual(expectedOutput)
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
      const zippedBuffer = await sut.getJobOutputs('foo')
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
