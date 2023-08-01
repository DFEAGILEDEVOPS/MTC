import { SchoolImportService } from './school-import.service'
import { ConnectionPool } from 'mssql'
import config from '../../config'
import { SchoolImportJobOutput } from './SchoolImportJobOutput'
import { type ISchoolDataService } from './data-access/school.data.service'
import { SchoolImportError } from './SchoolImportError'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { type IJobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'

let sut: SchoolImportService
let jobResult: SchoolImportJobOutput
let schoolDataServiceMock: ISchoolDataService
let consoleLogger: ILogger
let jobDataServiceMock: IJobDataService

const csvHeaders = 'URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryLowAge,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code),TypeOfEstablishment (name)'

describe('#SchoolImportService', () => {
  beforeEach(() => {
    schoolDataServiceMock = {
      bulkUpload: jest.fn(),
      individualUpload: jest.fn()
    }
    jobResult = new SchoolImportJobOutput()
    consoleLogger = new ConsoleLogger()
    jobDataServiceMock = {
      getJobId: jest.fn(),
      setJobComplete: jest.fn(),
      setJobStarted: jest.fn()
    }
    sut = new SchoolImportService(new ConnectionPool(config.Sql), jobResult, consoleLogger, schoolDataServiceMock, undefined, jobDataServiceMock)
    // quieten down the console logs
    // jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('is defined', () => {
    expect(sut).toBeInstanceOf(SchoolImportService)
  })

  test('if mapping fails error details are added to job output', async () => {
    try {
      const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
      await sut.process('', blobName)
      fail('mapping should have failed due to no data')
    } catch (error: any) {
      expect(error).toBeInstanceOf(SchoolImportError)
      expect(error.jobResult).toBeDefined()
      expect((error as SchoolImportError).jobResult.getErrorOutput()).toContain('Failed to map columns')
    }
  })

  test('data service job results should be appended to existing job result object', async () => {
    const csv = `${csvHeaders}
    12345,123,4567,My School,9,9,4,3,4`
    const retainedMessage = 'foo'
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    // eslint-disable-next-line @typescript-eslint/dot-notation
    sut['jobResult'].stdout.push(retainedMessage)
    const jobResult = await sut.process(csv, blobName)
    expect(jobResult.stdout.shift()).toStrictEqual(retainedMessage)
  })

  test('data is filtered and persisted when valid', async () => {
    const csv = `${csvHeaders}
    12345,123,4567,My School,9,9,4,3,4`
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    const jobResult = await sut.process(csv, blobName)
    expect(jobResult).toBeInstanceOf(SchoolImportJobOutput)
    expect(jobResult.getErrorOutput()).toHaveLength(0)
  })

  test('when missing header error occurs, only 1 entry is logged to error output', async () => {
    const csv = '12345,123,4567,My School,9,9,4,3,4'
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    try {
      await sut.process(csv, blobName)
      fail('should have thrown due to no column header row')
    } catch (error) {
      expect(error).toBeInstanceOf(SchoolImportError)
      const jobResult = (error as SchoolImportError).jobResult
      expect(jobResult.stderr).toHaveLength(1)
      expect(jobResult.stdout).toHaveLength(0)
    }
  })

  test('when predicate matches fail all records, it reports and exits', async () => {
    const csv = `${csvHeaders}
    12345,0,4567,My School,9,9,1,3,4`
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    const jobResult = await sut.process(csv, blobName)
    expect(jobResult).toBeInstanceOf(SchoolImportJobOutput)
    expect(jobResult.getErrorOutput()).toHaveLength(0)
    expect(jobResult.stdout).toHaveLength(2)
    expect(jobResult.stdout[1]).toBe('school records excluded in filtering:1. No records to persist, exiting.')
    expect(schoolDataServiceMock.individualUpload).toHaveBeenCalledTimes(0)
  })

  test('does not import schools without a name', async () => {
    const csv = `${csvHeaders}
\n99900,999,9000,Guys School 1,8,10,1,7,4\n99901,999,9001,,8,10,1,7,4\n99902,999,9002,Guys Closed School,8,10,2,7,4`
    jest.spyOn(schoolDataServiceMock, 'bulkUpload').mockImplementation()
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    await sut.process(csv, blobName)
    expect(schoolDataServiceMock.individualUpload).toHaveBeenCalledTimes(1)
  })

  test('throws an error if the csv does not have a header row', async () => {
    const csv = ''
    jest.spyOn(schoolDataServiceMock, 'individualUpload').mockImplementation()
    try {
      const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
      await sut.process(csv, blobName)
      fail('expected to throw')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe('no header row found')
    }
  })

  test('it updates the job status to processing when the job starts', async () => {
    const csv = `${csvHeaders}
    12345,123,4567,My School,9,9,4,3,4`
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    await sut.process(csv, blobName)
    expect(jobDataServiceMock.setJobStarted).toHaveBeenCalledWith(blobName)
  })

  test('it throws an error if the blobName/jobSlug is not provided', async () => {
    const csv = `${csvHeaders}
    12345,123,4567,My School,9,9,4,3,4`
    jest.spyOn(consoleLogger, 'warn')
    try {
      await sut.process(csv, '')
      fail('should have thrown an error')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe('blobName is undefined. Unable to continue processing as cannot identify job record without blobName')
    }
    expect(jobDataServiceMock.setJobStarted).not.toHaveBeenCalled()
  })

  test('it updates the job status if it completes without errors', async () => {
    const csv = `${csvHeaders}
    12345,123,4567,My School,9,9,1,3,4`
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    await sut.process(csv, blobName)

    expect(jobDataServiceMock.setJobComplete).toHaveBeenCalledWith(blobName, 'COM', '')
  })

  test('it updates the job status failed if the mapping fails', async () => {
    // low age header excluded from csv
    const csv = `URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code),TypeOfEstablishment (name)
    12345,123,4567,My School,9,9,4,3,4`
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    try {
      await sut.process(csv, blobName)
    } catch (ignored) {
    }

    expect(jobDataServiceMock.setJobComplete).toHaveBeenCalledWith(blobName, JobStatusCode.Failed, '', 'Headers "StatutoryLowAge" not found')
  })

  test('it updates the job status failed if the upload fails', async () => {
    const mockErrorMessage = 'mock error, please ignore'
    const csv = `${csvHeaders}
    12345,123,4567,My School,9,9,3,3,4`
    jest.spyOn(schoolDataServiceMock, 'individualUpload').mockRejectedValue(new Error(mockErrorMessage))
    const blobName = 'aad9f3b5-7a77-44cd-96b6-dcdc41c9ea76'
    try {
      await sut.process(csv, blobName)
    } catch (ignored) {
      console.log(ignored)
    }

    expect(jobDataServiceMock.setJobComplete).toHaveBeenCalledWith(blobName, JobStatusCode.Failed, '', mockErrorMessage)
  })
})
