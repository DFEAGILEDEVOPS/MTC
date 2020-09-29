
import { Context } from '@azure/functions'
import csvString from 'csv-string'
import moment from 'moment'
import * as R from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { AsyncBlobService, IBlobStorageService } from '../../azure/storage-helper'
import { CensusImportDataService, ICensusImportDataService } from './census-import.data.service'
import { IJobDataService, JobDataService } from './job.data.service'

export class CensusImportV1 {

  private censusImportDataService: ICensusImportDataService
  private jobDataService: IJobDataService
  private blobStorageService: IBlobStorageService

  constructor (censusImportDataService?: ICensusImportDataService, jobDataService?: IJobDataService, blobStorageService?: IBlobStorageService) {
    if (censusImportDataService === undefined) {
      censusImportDataService = new CensusImportDataService()
    }
    this.censusImportDataService = censusImportDataService

    if (jobDataService === undefined) {
      jobDataService = new JobDataService()
    }
    this.jobDataService = jobDataService

    if (blobStorageService === undefined) {
      blobStorageService = new AsyncBlobService()
    }
    this.blobStorageService = blobStorageService
  }

  async process (context: Context, blob: any) {
    const rowsAffected = await this.handleCensusImport(context, blob)
    return {
      processCount: rowsAffected
    }
  }

  private async handleCensusImport (context: Context, blob: any): Promise<number> {
    const jobUrlSlug = R.compose(arr => arr[arr.length - 1], r => r.split('/'))(context.bindingData.uri)
    const pool = await this.censusImportDataService.initPool(context)

    // Update job status to Processing
    const jobId = await this.jobDataService.updateStatus(pool, jobUrlSlug, 'PRC')

    const blobContent = csvString.parse(blob.toString())
    const censusTable = `[mtc_census_import].[census_import_${moment.utc().format('YYYYMMDDHHMMSS')}_${uuidv4()}]`
    const stagingInsertCount = await this.censusImportDataService.loadStagingTable(context, pool, censusTable, blobContent)
    const pupilMeta = await this.censusImportDataService.loadPupilsFromStaging(context, pool, censusTable, jobId)

    await this.censusImportDataService.deleteStagingTable(context, pool, censusTable)
    await this.blobStorageService.deleteContainerAsync('census')

    const jobOutput = `${stagingInsertCount} rows in uploaded file, ${pupilMeta.insertCount} inserted to pupil table, ${pupilMeta.errorCount} rows containing errors`

    if (stagingInsertCount !== pupilMeta.insertCount) {
      const errorOutput = pupilMeta.errorText
      await this.jobDataService.updateStatus(pool, jobUrlSlug, 'CWR', jobOutput, errorOutput)
      context.log.warn(`census-import: ${stagingInsertCount} rows staged, but only ${pupilMeta.insertCount} rows inserted to pupil table`)
    } else {
      const jobOutput = `${stagingInsertCount} rows staged and ${pupilMeta.insertCount} rows inserted to pupil table`
      await this.jobDataService.updateStatus(pool, jobUrlSlug, 'COM', jobOutput)
    }
    await pool.close()
    return pupilMeta.insertCount
  }
}
