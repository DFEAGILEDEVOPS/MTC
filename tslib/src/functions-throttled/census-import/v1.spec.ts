'use strict'

import { ConnectionPool } from 'mssql'
/* global describe expect it spyOn */

// remove...
import * as csv from '@fast-csv/parse'

import { CensusImportV1 } from './v1'
import config from '../../config'
import { ICensusImportDataService } from './census-import.data.service'
import { IJobDataService } from './job.data.service'
import { IBlobStorageService } from '../../azure/storage-helper'
import { ILogger } from '../../common/logger'

const stagingTableLoadCount = 5

const CensusImportDataServiceMock = jest.fn<ICensusImportDataService, any>(() => ({
  deleteStagingTable: jest.fn(),
  loadPupilsFromStaging: jest.fn((tableName: string, jobId: string) => {
    return Promise.resolve({
      pupilMeta: stagingTableLoadCount
    })
  }),
  loadStagingTable: jest.fn((tableName: string, blobContent: any) => {
    return Promise.resolve(stagingTableLoadCount)
  })
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

describe('census-import: v1', () => {
  beforeEach(() => {
    censusImportDataServiceMock = new CensusImportDataServiceMock()
    jobDataServiceMock = new JobDataServiceMock()
    blobStorageServiceMock = new BlobStorageServiceMock()
    loggerMock = new LoggerMock()
    sut = new CensusImportV1(new ConnectionPool(config.Sql),
    censusImportDataServiceMock,
    jobDataServiceMock,
    blobStorageServiceMock,
    loggerMock)
  })

  test('subject is defined', () => {
    expect(sut).toBeInstanceOf(CensusImportV1)
  })

  test('job status is updated at start and end of a successful run', async () => {
    await sut.process('foo,bar', '')
    expect(jobDataServiceMock.updateStatus).toHaveBeenCalledTimes(2)
  })

  test('csv parser works on raw csv string', () => {
    const input = 'foo,bar,buz,bar\nabc,def,ghi,jkl'
    const output = csv.parseString(input)
    expect(output).toBeDefined()
    expect(typeof output).toBe('string')
    console.dir(output)
  })


})
