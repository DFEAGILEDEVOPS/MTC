import { ConnectionPool } from 'mssql'
import { CensusImportV1 } from './v1'
import config from '../../config'
import { ICensusImportDataService } from './census-import.data.service'
import { IJobDataService } from './job.data.service'
import { IBlobStorageService } from '../../azure/storage-helper'
import { ILogger } from '../../common/logger'

const CensusImportDataServiceMock = jest.fn<ICensusImportDataService, any>(() => ({
  deleteStagingTable: jest.fn(),
  loadPupilsFromStaging: jest.fn(),
  loadStagingTable: jest.fn()
}))

const JobDataServiceMock = jest.fn<IJobDataService, any>(() => ({
  updateStatus: jest.fn()
}))

const BlobStorageServiceMock = jest.fn<IBlobStorageService, any>(() => ({
  deleteContainerAsync: jest.fn()
}))

const LoggerMock = jest.fn<ILogger, any>(() => ({
  error: jest.fn(),
  info: jest.fn(),
  verbose: jest.fn(),
  warn: jest.fn()
}))

let sut: CensusImportV1
let censusImportDataServiceMock: ICensusImportDataService
let jobDataServiceMock: IJobDataService
let blobStorageServiceMock: IBlobStorageService
let loggerMock: ILogger
const loadAndInsertCount = 5

describe('census-import: v1', () => {
  beforeEach(() => {
    censusImportDataServiceMock = new CensusImportDataServiceMock()
    censusImportDataServiceMock.loadPupilsFromStaging = jest.fn(async () => {
      return Promise.resolve({
        insertCount: loadAndInsertCount
      })
    })
    censusImportDataServiceMock.loadStagingTable = jest.fn(async () => {
      return Promise.resolve(loadAndInsertCount)
    })
    jobDataServiceMock = new JobDataServiceMock()
    jobDataServiceMock.updateStatus = jest.fn(async () => {
      return Promise.resolve(123)
    })
    blobStorageServiceMock = new BlobStorageServiceMock()
    loggerMock = new LoggerMock()
    sut = new CensusImportV1(new ConnectionPool(config.Sql),
      loggerMock,
      censusImportDataServiceMock,
      jobDataServiceMock,
      blobStorageServiceMock)
  })

  const blobUri = 'path/to/the/blob.csv'

  test('subject is defined', () => {
    expect(sut).toBeInstanceOf(CensusImportV1)
  })

  test('job status is updated at start and end of a successful run', async () => {
    const output = await sut.process('foo,bar', blobUri)
    expect(jobDataServiceMock.updateStatus).toHaveBeenCalledTimes(2)
    expect(jobDataServiceMock.updateStatus).toHaveBeenLastCalledWith(expect.any(String), 'COM', expect.any(String))
    expect(output.processCount).toEqual(loadAndInsertCount)
  })

  test('staging table is deleted at end of a successful run', async () => {
    await sut.process('foo,bar', blobUri)
    expect(censusImportDataServiceMock.deleteStagingTable).toHaveBeenCalledTimes(1)
  })

  test('census blob container is deleted at end of a successful run', async () => {
    await sut.process('foo,bar', blobUri)
    expect(blobStorageServiceMock.deleteContainerAsync).toHaveBeenCalledTimes(1)
  })

  test('when insert counts do not match, job is reported as failed', async () => {
    censusImportDataServiceMock.loadStagingTable = jest.fn(async () => {
      return Promise.resolve(loadAndInsertCount - 1)
    })
    await sut.process('foo,bar', blobUri)
    expect(jobDataServiceMock.updateStatus).toHaveBeenLastCalledWith(expect.any(String), 'CWR', expect.any(String), expect.any(String))
  })
})
