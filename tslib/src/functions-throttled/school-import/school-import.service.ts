import { Context } from '@azure/functions'
import { ConnectionPool } from 'mssql'
import * as csv from 'csv-string'
import { ISchoolDataService, SchoolDataService } from './data-access/school.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { SchoolImportJobResult } from './SchoolImportJobResult'
import { ISchoolImportPredicates, Predicates } from './predicates'
import { SchoolRecordMapper } from './school-mapper'
import { SchoolImportError } from './SchoolImportError'
import { ISchoolRecord } from './data-access/ISchoolRecord'

const name = 'school-import'
const targetAge = 9

export class SchoolImportService {

  private schoolDataService: ISchoolDataService
  private logger: ILogger
  private jobResult: SchoolImportJobResult
  private predicates: ISchoolImportPredicates
  private schoolRecordMapper: SchoolRecordMapper

  constructor (pool: ConnectionPool,
                jobResult: SchoolImportJobResult,
                schoolDataService?: ISchoolDataService,
                predicates?: ISchoolImportPredicates,
                logger?: ILogger) {

    if (schoolDataService === undefined) {
      schoolDataService = new SchoolDataService(pool, jobResult)
    }
    this.schoolDataService = schoolDataService
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
  }

  async process (context: Context, blob: any): Promise<SchoolImportJobResult> {
    this.jobResult.reset()
    this.logger.verbose('school-import.v1.process() called')
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
      const dataWithoutHeader = csvParsed.shift()
      if (dataWithoutHeader === undefined) {
        throw new Error('no data after removing header row')
      }
      mapping = this.schoolRecordMapper.mapColumns(dataWithoutHeader, mapper)
      this.logger.verbose(`${name} mapping `, mapping)
    } catch (error) {
      this.jobResult.stderr = [`Failed to map columns, error raised was ${error.message}`]
      throw new SchoolImportError(this.jobResult, error.message)
    }

    try {
      const filteredSchools = new Array<any>()
      for (let index = 0; index < csvParsed.length; index++) {
        const row = csvParsed[index]
        const schoolRecord = this.schoolRecordMapper.mapRow(row, mapping)
        const isOpen = this.predicates.isSchoolOpen(schoolRecord)
        const isCorrectTypeGroup = this.predicates.isRequiredEstablishmentTypeGroup(schoolRecord)
        const isCorrectAgeRange = this.predicates.isAgeInRange(targetAge, schoolRecord)
        const matchesAll = isOpen.isMatch && isCorrectTypeGroup.isMatch && isCorrectAgeRange.isMatch
        if (matchesAll) {
          filteredSchools.push(schoolRecord)
        } else {
          this.jobResult.stdout.push(this.createLogEntry(isOpen.message))
          this.jobResult.stdout.push(this.createLogEntry(isCorrectTypeGroup.message))
          this.jobResult.stdout.push(this.createLogEntry(isCorrectAgeRange.message))
        }
      }
      this.jobResult = await this.schoolDataService.bulkUpload(context.log, filteredSchools, mapping)
      this.logger.verbose(`${name}  bulkUpload complete`)
      return this.jobResult
    } catch (error) {
      throw new SchoolImportError(this.jobResult, error.message)
    }
  }

  private createLogEntry (msg: string): string {
    if (msg.length > 0) {
      return `${(new Date()).toISOString()} school-import: ${msg}`
    }
    return ''
  }

  isPredicated (school: ISchoolRecord): boolean {
    const result = this.predicates.isSchoolOpen(school).isMatch &&
      this.predicates.isRequiredEstablishmentTypeGroup(school).isMatch &&
      this.predicates.isAgeInRange(targetAge, school).isMatch
    throw new Error(`result:${result} incomplete - we need the messages!`)
  }
}
