import { ConnectionPool } from 'mssql'
import * as csv from 'csv-string'
import { ISchoolDataService, SchoolDataService } from './data-access/school.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { SchoolImportJobOutput } from './SchoolImportJobOutput'
import { ISchoolImportPredicates, Predicates } from './predicates'
import { SchoolRecordMapper } from './school-mapper'
import { SchoolImportError } from './SchoolImportError'
import { ISchoolRecord } from './data-access/ISchoolRecord'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const name = 'school-import'
const targetAge = 9

// Copy from the DB which is the source of truth
const jobStatusCode = {
  Processing: 'PRC',
  Completed: 'COM',
  CompletedWithErrors: 'CWR',
  Failed: 'FLD'
}

export class SchoolImportService {
  private readonly schoolDataService: ISchoolDataService
  private readonly logger: ILogger
  private jobResult: SchoolImportJobOutput
  private readonly predicates: ISchoolImportPredicates
  private readonly schoolRecordMapper: SchoolRecordMapper
  private jobId: number | undefined

  constructor (pool: ConnectionPool,
    jobResult: SchoolImportJobOutput,
    logger?: ILogger,
    schoolDataService?: ISchoolDataService,
    predicates?: ISchoolImportPredicates) {
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
  }

  async updateJobStatusToProcessing (): Promise<void> {
    this.logger.verbose(`${name}: updateJobStatusToProcessing() called`)
    if (this.jobId !== undefined) {
      return this.schoolDataService.updateJobStatus(this.jobId, jobStatusCode.Processing)
    }
  }

  async updateJobStatusToCompleted (): Promise<void> {
    this.logger.verbose(`${name}: updateJobStatusToCompleted() called`)
    if (this.jobId !== undefined) {
      if (this.jobResult.hasError()) {
        return this.schoolDataService.updateJobStatusWithResult(this.jobId, jobStatusCode.CompletedWithErrors, this.jobResult)
      } else {
        return this.schoolDataService.updateJobStatusWithResult(this.jobId, jobStatusCode.Completed, this.jobResult)
      }
    }
  }

  async updateJobStatusToFailed (error: Error): Promise<void> {
    this.logger.verbose(`${name}: updateJobStatusToFailed() called`)
    if (this.jobId !== undefined) {
      return this.schoolDataService.updateJobStatusWithResultAndError(this.jobId, jobStatusCode.Failed, this.jobResult, error)
    }
  }

  async process (blob: any): Promise<SchoolImportJobOutput> {
    this.logger.verbose(`${name}: process() called`)

    // The admin should always create a job for this process
    const jobId = await this.schoolDataService.getJobId()
    if (jobId !== undefined) {
      this.jobId = jobId
      await this.updateJobStatusToProcessing()
    } else {
      this.logger.warn(`${name}: WARNING: no job id found`)
    }

    // Parse the CSV string and get the header mapping
    let mapping, columnHeaders, csvParsed
    try {
      csvParsed = csv.parse(blob.toString())
      columnHeaders = csvParsed.shift()
      mapping = this.getMapping(columnHeaders)
    } catch (error) {
      await this.updateJobStatusToFailed(error)
      throw new SchoolImportError(this.jobResult, error)
    }

    try {
      const { filteredSchools, exclusionCount } = this.filterSchools(csvParsed, mapping)
      if (filteredSchools.length === 0) {
        const exitMessage = `school records excluded in filtering:${exclusionCount}. No records to persist, exiting.`
        this.jobResult.stdout.push(exitMessage)
        await this.updateJobStatusToCompleted()
        this.logger.verbose(`${name}: no schools found to upload. Exiting.`)
        return this.jobResult
      }
      this.logger.verbose(`${name}  bulkUpload starting`)
      await this.schoolDataService.bulkUpload(filteredSchools)
      this.logger.verbose(`${name}  bulkUpload complete`)
      await this.updateJobStatusToCompleted()
      return this.jobResult
    } catch (error) {
      await this.updateJobStatusToFailed(error)
      throw new SchoolImportError(this.jobResult, error)
    }
  }

  private filterSchools (csvParsed: string[][], mapping: Record<string, number>): { filteredSchools: ISchoolRecord[], exclusionCount: number} {
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
      ['StatutoryLowAge', 'statLowAge'],
      ['StatutoryHighAge', 'statHighAge'],
      ['EstablishmentStatus (code)', 'estabStatusCode'],
      ['TypeOfEstablishment (code)', 'estabTypeCode'],
      ['EstablishmentTypeGroup (code)', 'estabTypeGroupCode']
    ]

    try {
      if (columnHeaders === undefined || columnHeaders.length === 0 || R.equals(columnHeaders, [''])) {
        throw new Error('no header row found')
      }
      return this.schoolRecordMapper.mapColumns(columnHeaders, mapper)
    } catch (error) {
      this.jobResult.stderr = [`Failed to map columns, error raised was ${error.message}`]
      throw new SchoolImportError(this.jobResult, error)
    }
  }

  private static createLogEntry (msg: string): string {
    if (msg.length > 0) {
      return `${(new Date()).toISOString()} school-import: ${msg}`
    }
    return ''
  }
}
