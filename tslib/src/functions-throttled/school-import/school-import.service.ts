import { ConnectionPool } from 'mssql'
import * as csv from 'csv-string'
import { ISchoolDataService, SchoolDataService } from './data-access/school.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { SchoolImportJobResult } from './SchoolImportJobResult'
import { ISchoolImportPredicates, Predicates } from './predicates'
import { SchoolRecordMapper } from './school-mapper'
import { SchoolImportError } from './SchoolImportError'
import { ISchoolRecord } from './data-access/ISchoolRecord'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const name = 'school-import'
const targetAge = 9

// Copy from the DB which is the source of truth
// TODO: keep these in sync automatically
const jobStatusCode = {
  Processing: 'PRC',
  Completed: 'COM',
  CompletedWithErrors: 'CWR',
  Failed: 'FLD'
}

export class SchoolImportService {
  private readonly schoolDataService: ISchoolDataService
  private readonly logger: ILogger
  private jobResult: SchoolImportJobResult
  private readonly predicates: ISchoolImportPredicates
  private readonly schoolRecordMapper: SchoolRecordMapper
  private jobId: number | undefined

  constructor (pool: ConnectionPool,
    jobResult: SchoolImportJobResult,
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
    const jobId = await this.schoolDataService.getJobId()
    if (jobId !== undefined) {
      this.jobId = jobId
      return this.schoolDataService.updateJobStatus(jobId, jobStatusCode.Processing)
    }
  }

  async updateJobStatusToCompleted (jobResult: SchoolImportJobResult): Promise<void> {
    this.logger.verbose(`${name}: updateJobStatusToCompleted() called`)
    if (this.jobId !== undefined) {
      if (jobResult.stderr.length > 0) {
        return this.schoolDataService.updateJobStatusWithResult(this.jobId, jobStatusCode.CompletedWithErrors, jobResult)
      } else {
        return this.schoolDataService.updateJobStatusWithResult(this.jobId, jobStatusCode.Completed, jobResult)
      }
    }
  }

  async updateJobStatusToFailed (jobResult: SchoolImportJobResult, error: Error): Promise<void> {
    this.logger.verbose(`${name}: updateJobStatusToFailed() called`)
    if (this.jobId !== undefined) {
      return this.schoolDataService.updateJobStatusWithResultAndError(this.jobId, jobStatusCode.Failed, jobResult, error)
    }
  }

  async process (blob: any): Promise<SchoolImportJobResult> {
    this.logger.verbose(`${name}: process() called`)
    const csvParsed = csv.parse(blob.toString())
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

    let mapping
    try {
      const columnHeaders = csvParsed.shift()
      if (columnHeaders === undefined || columnHeaders.length === 0 || R.equals(columnHeaders, [''])) {
        throw new Error('no header row found')
      }
      mapping = this.schoolRecordMapper.mapColumns(columnHeaders, mapper)
    } catch (error) {
      this.jobResult.stderr = [`Failed to map columns, error raised was ${error.message}`]
      throw new SchoolImportError(this.jobResult, error)
    }

    try {
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
            this.jobResult.stdout.push(this.createLogEntry(isOpen.message))
          }
          if (RA.isNotNilOrEmpty(isCorrectTypeGroup.message)) {
            this.jobResult.stdout.push(this.createLogEntry(isCorrectTypeGroup.message))
          }
          if (RA.isNotNilOrEmpty(isCorrectAgeRange.message)) {
            this.jobResult.stdout.push(this.createLogEntry(isCorrectAgeRange.message))
          }
          if (RA.isNotNilOrEmpty(hasRequiredFields.message)) {
            this.jobResult.stdout.push(this.createLogEntry(hasRequiredFields.message))
          }
        }
      }
      if (filteredSchools.length === 0) {
        const exitMessage = `school records excluded in filtering:${exclusionCount}. No records to persist, exiting.`
        this.jobResult.stdout.push(exitMessage)
        return this.jobResult
      }
      this.logger.verbose(`${name}  bulkUpload starting`)
      await this.schoolDataService.bulkUpload(filteredSchools)
      this.logger.verbose(`${name}  bulkUpload complete`)
      return this.jobResult
    } catch (error) {
      throw new SchoolImportError(this.jobResult, error)
    }
  }

  private createLogEntry (msg: string): string {
    if (msg.length > 0) {
      return `${(new Date()).toISOString()} school-import: ${msg}`
    }
    return ''
  }
}
