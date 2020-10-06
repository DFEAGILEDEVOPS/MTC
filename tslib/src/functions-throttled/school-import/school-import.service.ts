import { Context } from '@azure/functions'
import { ConnectionPool } from 'mssql'
import * as csv from 'csv-string'
import { ISchoolDataService, SchoolDataService } from './data-access/school.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { SchoolImportJobResult } from './ISchoolImportJobResult'

const name = 'school-import'

export class SchoolImportService {

  private schoolDataService: ISchoolDataService
  private logger: ILogger
  private jobResult: SchoolImportJobResult

  constructor (pool: ConnectionPool, jobResult: SchoolImportJobResult, schoolDataService?: ISchoolDataService) {
    if (schoolDataService === undefined) {
      schoolDataService = new SchoolDataService(pool, jobResult)
    }
    this.schoolDataService = schoolDataService
    // temp fix, will inject
    this.logger = new ConsoleLogger()
    this.jobResult = jobResult
  }

  async process (context: Context, blob: any): Promise<SchoolImportJobResult> {
    this.jobResult = {
      stderr: [],
      stdout: [],
      schoolsLoaded: 0,
      linesProcessed: 0
    }
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
      mapping = this.mapColumns(csvParsed.shift(), mapper)
      this.logger.verbose(`${name} mapping `, mapping)
    } catch (error) {
      this.jobResult.stderr = [`Failed to map columns, error raised was ${error.message}`]
      this.exportJobResults(context, this.jobResult)
      throw error
    }

    try {
      this.jobResult = await this.schoolDataService.bulkUpload(context.log, csvParsed, mapping, this.jobResult)
      this.logger.verbose(`${name}  bulkUpload complete`)
      this.exportJobResults(context, this.jobResult)
      this.logger.verbose(`${name} job results exported`)
      return this.jobResult
    } catch (error) {
      if (error.jobResult) {
        this.exportJobResults(context, error.jobResult)
      }
      throw error
    }
  }

  /**
   * Find the array indexes we need out of the entire CSV
   * @param {string[]} cols - Header row of csv file as an array of strings
   * @param {Array<[header, key]>} headers - array of pairs
   *                               where each pair is the col name to search for in the header row and the object
   *                               key to return.
   * @return {key: number, ...}    Return obj with the index of the desired columns to use mapped to the keys provided
   */
  mapColumns (cols: any, headers: any) {
    const quote = (s: string) => `"${s}"`
    const quoteAndJoin = (ary: Array<any>) => { return ary.map(quote).join(', ') }
    const mapping: any = {}
    const missingHeaders = new Array<any>()

    headers.forEach((pair: any) => {
      const n = cols.indexOf(pair[0])
      if (n === -1) {
        missingHeaders.push(pair[0])
      } else {
        mapping[pair[1]] = n
      }
    })
    if (missingHeaders.length > 0) {
      throw new Error('Headers ' + quoteAndJoin(missingHeaders) + ' not found')
    }
    return mapping
  }

  /**
   * Write to output bindings so that they can be written to blob storage
   * @param context
   * @param jobResult
   */
  private exportJobResults (context: Context, jobResult: SchoolImportJobResult) {
    this.logger.verbose(`${name} exportJobResults() called`)
    context.bindings.schoolImportStdout = jobResult.stdout.join('\n')
    context.bindings.schoolImportStderr = jobResult.stderr.join('\n')
  }
}
