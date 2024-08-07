import { type ConnectionPool } from 'mssql'
import * as csv from 'csv-string'
import { type ISchoolDataService, SchoolDataService } from './data-access/school.data.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { type SchoolImportJobOutput } from './SchoolImportJobOutput'
import { type ISchoolImportPredicates, Predicates } from './predicates'
import { SchoolRecordMapper } from './school-mapper'
import { SchoolImportError } from './SchoolImportError'
import { type ISchoolRecord } from './data-access/ISchoolRecord'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { type IJobDataService, JobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'

const name = 'school-import'
const targetAge = 9

export class SchoolImportService {
  private readonly schoolDataService: ISchoolDataService
  private readonly logger: ILogger
  private readonly jobResult: SchoolImportJobOutput
  private readonly predicates: ISchoolImportPredicates
  private readonly schoolRecordMapper: SchoolRecordMapper
  private readonly jobDataService: IJobDataService

  constructor (pool: ConnectionPool,
    jobResult: SchoolImportJobOutput,
    logger?: ILogger,
    schoolDataService?: ISchoolDataService,
    predicates?: ISchoolImportPredicates,
    jobDataService?: IJobDataService) {
    if (predicates === undefined) {
      predicates = new Predicates()
    }
    this.predicates = predicates
    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger
    this.jobResult = jobResult
    this.schoolRecordMapper = new SchoolRecordMapper()
    this.schoolDataService = schoolDataService ?? new SchoolDataService(this.logger, pool, jobResult)
    this.jobDataService = jobDataService ?? new JobDataService()
  }

  private async updateJobStatusToProcessing (jobSlug: string): Promise<any> {
    this.logger.trace(`${name}: updateJobStatusToProcessing() called`)
    return this.jobDataService.setJobStarted(jobSlug)
  }

  private async updateJobStatusToCompleted (jobSlug: string): Promise<any> {
    this.logger.trace(`${name}: updateJobStatusToCompleted() called`)
    if (this.jobResult.hasError()) {
      return this.jobDataService.setJobComplete(jobSlug, JobStatusCode.CompletedWithErrors, this.jobResult.getStandardOutput(), this.jobResult.getErrorOutput())
    } else {
      return this.jobDataService.setJobComplete(jobSlug, JobStatusCode.CompletedSuccessfully, this.jobResult.getStandardOutput())
    }
  }

  private async updateJobStatusToFailed (jobSlug: string, error: Error): Promise<any> {
    this.logger.trace(`${name}: updateJobStatusToFailed() called`)
    return this.jobDataService.setJobComplete(jobSlug, JobStatusCode.Failed, this.jobResult.getStandardOutput(), error.message)
  }

  async process (blob: any, blobNameWithoutExtension: string): Promise<SchoolImportJobOutput> {
    this.logger.trace(`${name}: process() called`)
    // The admin app creates a job on file upload by service manager
    // The blob name is set to the url slug of the created job.
    if (blobNameWithoutExtension === undefined || blobNameWithoutExtension === '') {
      throw new Error('blobName is undefined. Unable to continue processing as cannot identify job record without blobName')
    }
    const jobSlug = blobNameWithoutExtension
    await this.updateJobStatusToProcessing(jobSlug)

    // Parse the CSV string and get the header mapping
    let mapping, columnHeaders, csvParsed
    try {
      csvParsed = csv.parse(blob.toString())
      columnHeaders = csvParsed.shift()
      mapping = this.getMapping(columnHeaders)
    } catch (error) {
      await this.updateJobStatusToFailed(jobSlug, error as Error)
      throw new SchoolImportError(this.jobResult, error as Error)
    }

    try {
      const { filteredSchools, exclusionCount } = this.filterSchools(csvParsed, mapping)
      if (filteredSchools.length === 0) {
        const exitMessage = `school records excluded in filtering:${exclusionCount}. No records to persist, exiting.`
        this.jobResult.stdout.push(exitMessage)
        await this.updateJobStatusToCompleted(jobSlug)
        this.logger.trace(`${name}: no schools found to upload. Exiting.`)
        return this.jobResult
      }
      this.logger.trace(`${name}  school import starting`)
      await this.schoolDataService.individualUpload(filteredSchools)
      this.logger.trace(`${name}  school import complete`)
      await this.updateJobStatusToCompleted(jobSlug)
      return this.jobResult
    } catch (error) {
      await this.updateJobStatusToFailed(jobSlug, error as Error)
      throw new SchoolImportError(this.jobResult, error as Error)
    }
  }

  private filterSchools (csvParsed: string[][], mapping: Record<string, number>): { filteredSchools: ISchoolRecord[], exclusionCount: number } {
    const filteredSchools: ISchoolRecord[] = []
    let exclusionCount = 0
    for (let index = 0; index < csvParsed.length; index++) {
      const row = csvParsed[index]
      const schoolRecord = this.schoolRecordMapper.mapRow(row, mapping)
      const hasRequiredFields = this.predicates.hasRequiredFields(schoolRecord)
      const isOpen = this.predicates.isSchoolOpen(schoolRecord)
      const isCorrectTypeGroup = this.predicates.isRequiredEstablishmentTypeGroup(schoolRecord)
      const isCorrectAgeRange = this.predicates.isAgeInRange(targetAge, schoolRecord)
      const matchesAll = hasRequiredFields.isMatch &&
        isOpen.isMatch &&
        isCorrectTypeGroup.isMatch &&
        isCorrectAgeRange.isMatch
      if (matchesAll) {
        filteredSchools.push(schoolRecord)
      } else {
        exclusionCount++
        if (RA.isNotNilOrEmpty(isOpen.message)) {
          this.jobResult.stdout.push(SchoolImportService.createLogEntry(isOpen.message))
        }
        if (RA.isNotNilOrEmpty(isCorrectTypeGroup.message)) {
          this.jobResult.stdout.push(SchoolImportService.createLogEntry(isCorrectTypeGroup.message))
        }
        if (RA.isNotNilOrEmpty(isCorrectAgeRange.message)) {
          this.jobResult.stdout.push(SchoolImportService.createLogEntry(isCorrectAgeRange.message))
        }
        if (RA.isNotNilOrEmpty(hasRequiredFields.message)) {
          this.jobResult.stdout.push(SchoolImportService.createLogEntry(hasRequiredFields.message))
        }
      }
    }
    return { filteredSchools, exclusionCount }
  }

  /**
   * Return an obect with the index in the csv file for each of the headers
   * TODO: add example
   * @param csvParsed
   * @private
   */
  private getMapping (columnHeaders: string[] | undefined): Record<string, number> {
    const mapper = [
      ['URN', 'urn'],
      ['LA (code)', 'leaCode'],
      ['EstablishmentNumber', 'estabCode'],
      ['EstablishmentName', 'name'],
      ['TypeOfEstablishment (code)', 'estabTypeCode'],
      ['TypeOfEstablishment (name)', 'estabTypeName'],
      ['StatutoryLowAge', 'statLowAge'],
      ['StatutoryHighAge', 'statHighAge'],
      ['EstablishmentStatus (code)', 'estabStatusCode'],
      ['EstablishmentTypeGroup (code)', 'estabTypeGroupCode']
    ]

    try {
      if (columnHeaders === undefined || columnHeaders.length === 0 || R.equals(columnHeaders, [''])) {
        throw new Error('no header row found')
      }
      return this.schoolRecordMapper.mapColumns(columnHeaders, mapper)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      this.jobResult.stderr = [`Failed to map columns, error raised was ${errorMessage}`]
      throw new SchoolImportError(this.jobResult, error as Error)
    }
  }

  private static createLogEntry (msg: string): string {
    if (msg.length > 0) {
      return `${(new Date()).toISOString()} school-import: ${msg}`
    }
    return ''
  }
}
