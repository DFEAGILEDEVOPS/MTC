import { ConnectionPool } from 'mssql'
import { CensusImportV1 } from './v1'
import config from '../../config'
import { type ICensusImportDataService } from './census-import.data.service'
import { type IBlobService } from '../../azure/blob-service'
import { type ILogger } from '../../common/logger'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { type IRedisService } from '../../caching/redis-service'
import { type IJobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'

const CensusImportDataServiceMock = jest.fn<ICensusImportDataService, any>(() => ({
  deleteStagingTable: jest.fn(),
  loadPupilsFromStaging: jest.fn(),
  loadStagingTable: jest.fn()
}))

const JobDataServiceMock = jest.fn<IJobDataService, any>(() => ({
  setJobComplete: jest.fn(),
  setJobStarted: jest.fn(),
  getJobId: jest.fn()
}))

const BlobServiceMock = jest.fn<IBlobService, any>(() => ({
  deleteBlob: jest.fn(),
  createBlob: jest.fn(),
  appendBlob: jest.fn()
}))

const LoggerMock = jest.fn<ILogger, any>(() => ({
  error: jest.fn(),
  info: jest.fn(),
  trace: jest.fn(),
  warn: jest.fn()
}))

let sut: CensusImportV1
let censusImportDataServiceMock: ICensusImportDataService
let jobDataServiceMock: IJobDataService
let blobServiceMock: IBlobService
let loggerMock: ILogger
let redisServiceMock: IRedisService
const loadAndInsertCount = 5

describe('census-import: v1', () => {
  beforeEach(() => {
    censusImportDataServiceMock = new CensusImportDataServiceMock()
    jest.spyOn(censusImportDataServiceMock, 'loadPupilsFromStaging').mockImplementation(async () => Promise.resolve({ insertCount: loadAndInsertCount }))
    jest.spyOn(censusImportDataServiceMock, 'loadStagingTable').mockImplementation(async () => Promise.resolve(loadAndInsertCount))
    jobDataServiceMock = new JobDataServiceMock()
    jest.spyOn(jobDataServiceMock, 'setJobStarted').mockImplementation()
    jest.spyOn(jobDataServiceMock, 'getJobId').mockResolvedValue(1)
    loggerMock = new LoggerMock()
    redisServiceMock = new RedisServiceMock()
    blobServiceMock = new BlobServiceMock()

    sut = new CensusImportV1(new ConnectionPool(config.Sql),
      loggerMock,
      censusImportDataServiceMock,
      blobServiceMock,
      redisServiceMock,
      jobDataServiceMock)
  })

  const blobUri = 'path/to/the/blob.csv'

  test('subject is defined', () => {
    expect(sut).toBeInstanceOf(CensusImportV1)
  })

  test('job status is updated at start and end of a successful run', async () => {
    const output = await sut.process('foo,bar', blobUri)
    expect(jobDataServiceMock.setJobStarted).toHaveBeenCalledTimes(1)
    expect(jobDataServiceMock.setJobComplete).toHaveBeenLastCalledWith(expect.any(String), JobStatusCode.CompletedSuccessfully, expect.any(String))
    expect(output.processCount).toStrictEqual(loadAndInsertCount)
  })

  test('staging table is deleted at end of a successful run', async () => {
    await sut.process('foo,bar', blobUri)
    expect(censusImportDataServiceMock.deleteStagingTable).toHaveBeenCalledTimes(1)
  })

  test('census blob container is deleted at end of a successful run', async () => {
    await sut.process('foo,bar', blobUri)
    expect(blobServiceMock.deleteBlob).toHaveBeenCalledTimes(1)
  })

  test('when insert counts do not match, job is reported as failed', async () => {
    jest.spyOn(censusImportDataServiceMock, 'loadStagingTable').mockImplementation(async () => Promise.resolve(loadAndInsertCount - 1))
    await sut.process('foo,bar', blobUri)
    expect(jobDataServiceMock.setJobComplete).toHaveBeenLastCalledWith(expect.any(String), JobStatusCode.CompletedWithErrors, expect.any(String), expect.any(String))
  })

  test('it invalidates the pupil register', async () => {
    await sut.process('foo, bar', blobUri)
    expect(redisServiceMock.dropByPrefix).toHaveBeenCalledWith('pupilRegisterViewData:')
  })
})
