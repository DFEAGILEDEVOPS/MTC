
import * as csvString from 'csv-string'
import moment from 'moment'
import * as R from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { AsyncBlobService, IBlobStorageService } from '../../azure/storage-helper'
import { CensusImportDataService, ICensusImportDataService } from './census-import.data.service'
import { IJobDataService, JobDataService } from './job.data.service'
import * as mssql from 'mssql'
import { ConsoleLogger, ILogger } from '../../common/logger'

export class CensusImportV1 {

  private pool: mssql.ConnectionPool
  private censusImportDataService: ICensusImportDataService
  private jobDataService: IJobDataService
  private blobStorageService: IBlobStorageService
  private logger: ILogger

  constructor (pool: mssql.ConnectionPool,
    logger?: ILogger,
    censusImportDataService?: ICensusImportDataService,
    jobDataService?: IJobDataService,
    blobStorageService?: IBlobStorageService) {

    this.pool = pool

    if (censusImportDataService === undefined) {
      censusImportDataService = new CensusImportDataService(this.pool)
    }
    this.censusImportDataService = censusImportDataService

    if (jobDataService === undefined) {
      jobDataService = new JobDataService(this.pool)
    }
    this.jobDataService = jobDataService

    if (blobStorageService === undefined) {
      blobStorageService = new AsyncBlobService()
    }
    this.blobStorageService = blobStorageService

    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger
  }

  async process (blob: any, blobUri: string) {
    const rowsAffected = await this.handleCensusImport(blob, blobUri)
    return {
      processCount: rowsAffected
    }
  }

  private async handleCensusImport (blob: any, blobUri: string): Promise<number> {
    const jobUrlSlug = R.compose((arr: any[]) => arr[arr.length - 1], (r: string) => r.split('/'))(blobUri)
    // Update job status to Processing
    const jobId = await this.jobDataService.updateStatus(jobUrlSlug, 'PRC')
    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_census_import].[census_import_${moment.utc().format('YYYYMMDDHHMMSS')}_${uuidv4()}]`
    const stagingInsertCount = await this.censusImportDataService.loadStagingTable(censusTable, blobContent)
    const pupilMeta = await this.censusImportDataService.loadPupilsFromStaging(censusTable, jobId)
    await this.censusImportDataService.deleteStagingTable(censusTable)
    await this.blobStorageService.deleteContainerAsync('census')

    const jobOutput = `${stagingInsertCount} rows in uploaded file, ${pupilMeta.insertCount} inserted to pupil table, ${pupilMeta.errorCount} rows containing errors`
    if (stagingInsertCount !== pupilMeta.insertCount) {
      const errorOutput = pupilMeta.errorText
      // update job to failed
      await this.jobDataService.updateStatus(jobUrlSlug, 'CWR', jobOutput, errorOutput)
      this.logger.warn(`census-import: ${stagingInsertCount} rows staged, but only ${pupilMeta.insertCount} rows inserted to pupil table`)
    } else {
      const jobOutput = `${stagingInsertCount} rows staged and ${pupilMeta.insertCount} rows inserted to pupil table`
      // update job to complete
      await this.jobDataService.updateStatus(jobUrlSlug, 'COM', jobOutput)
    }
    return pupilMeta.insertCount
  }
}
