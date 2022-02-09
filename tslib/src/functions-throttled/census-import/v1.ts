import * as csvString from 'csv-string'
import moment from 'moment'
import * as R from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { CensusImportDataService, ICensusImportDataService } from './census-import.data.service'
import * as mssql from 'mssql'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { IBlobService, BlobService } from '../../azure/blob-service'
import { IRedisService, RedisService } from '../../caching/redis-service'
import redisKeyService from '../../caching/redis-key.service'
import { IJobDataService, JobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'

export interface IJobResult {
  processCount: number
}

export class CensusImportV1 {
  private readonly pool: mssql.ConnectionPool
  private readonly censusImportDataService: ICensusImportDataService
  private readonly blobService: IBlobService
  private readonly logger: ILogger
  private readonly redisService: IRedisService
  private readonly jobDataService: IJobDataService

  constructor (pool: mssql.ConnectionPool,
    logger?: ILogger,
    censusImportDataService?: ICensusImportDataService,
    blobService?: IBlobService,
    redisService?: IRedisService,
    jobDataService?: IJobDataService) {
    this.pool = pool
    this.censusImportDataService = censusImportDataService ?? new CensusImportDataService(this.pool)
    this.blobService = blobService ?? new BlobService()
    this.logger = logger ?? new ConsoleLogger()
    this.redisService = redisService ?? new RedisService(this.logger)
    this.jobDataService = jobDataService ?? new JobDataService()
  }

  async process (blob: unknown, blobUri: string): Promise<IJobResult> {
    const rowsAffected = await this.handleCensusImport(blob, blobUri)
    return {
      processCount: rowsAffected
    }
  }

  private async handleCensusImport (blob: any, blobUri: string): Promise<number> {
    // extract the blob name (also the job slug) from the blob Uri
    const blobName = R.compose((arr: any[]) => arr[arr.length - 1], (r: string) => r.split('/'))(blobUri)
    // Update job status to Processing
    this.logger.info(`jobUrlSlug:${blobName}`)
    const jobId = await this.jobDataService.setJobStarted(blobName)
    this.logger.info(`jobId:${jobId}`)
    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_census_import].[census_import_${moment.utc().format('YYYYMMDDHHMMSS')}_${uuidv4()}]`
    this.logger.info(`censusTable:${censusTable}`)
    this.logger.info('inserting data to staging table...')
    const stagingInsertCount = await this.censusImportDataService.loadStagingTable(censusTable, blobContent)
    this.logger.info(`stagingInsertCount:${stagingInsertCount}`)

    const pupilMeta = await this.censusImportDataService.loadPupilsFromStaging(censusTable, jobId)
    await this.censusImportDataService.deleteStagingTable(censusTable)
    await this.blobService.deleteBlob(blobName, 'census')

    const jobOutput = `${stagingInsertCount} rows in uploaded file, ${pupilMeta.insertCount} inserted to pupil table, ${pupilMeta.errorCount} rows containing errors`
    if (stagingInsertCount !== pupilMeta.insertCount) {
      if (pupilMeta.errorText === undefined) {
        pupilMeta.errorText = ''
      }
      const errorOutput = `${pupilMeta.errorText}\nTip: Ensure all schools in the uploaded file have a matching entry in the MTC database.`
      // update job to failed
      await this.jobDataService.setJobComplete(blobName, JobStatusCode.CWR, jobOutput, errorOutput)
      this.logger.warn(`census-import: ${stagingInsertCount} rows staged, but only ${pupilMeta.insertCount} rows inserted to pupil table`)
    } else {
      const jobOutput = `${stagingInsertCount} rows staged and ${pupilMeta.insertCount} rows inserted to pupil table`
      // update job to complete
      await this.jobDataService.setJobComplete(blobName, JobStatusCode.COM, jobOutput)
    }

    // Finally, delete the pupil-register cache for all schools
    await this.deletePupilRegisterRedisCache()

    return pupilMeta.insertCount
  }

  async deletePupilRegisterRedisCache (): Promise<void> {
    const prefix = redisKeyService.getPupilRegisterPrefix()
    // Drop up to 20,000 keys
    await this.redisService.dropByPrefix(prefix)
  }
}
