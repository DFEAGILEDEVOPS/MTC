import { ConsoleLogger, ILogger } from '../../common/logger'
import { ISqlService, SqlService } from '../../sql/sql.service'
import {
  ICheckCompletionMessage,
  MarkedCheck,
  ValidatedCheck
} from '../sync-results-to-sql/models'
import { IAsyncTableService, AsyncTableService } from '../../azure/storage-helper'
import { UnsynchronisedCheck } from './models'
import { MarkedCheckTableEntity, ReceivedCheckTableEntity } from '../../schemas/models'
import * as R from 'ramda'
import { CompressionService, ICompressionService } from '../../common/compression-service'

const functionName = 'sync-results-init: SyncResultsInitService'

export class SyncResultsInitService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService
  private readonly tableService: IAsyncTableService
  private readonly compressionService: ICompressionService
  private readonly receivedCheckTableName = 'receivedCheck'
  private readonly markedCheckTableName = 'checkResult'

  constructor (logger?: ILogger, sqlService?: ISqlService, tableService?: IAsyncTableService, compressionService?: ICompressionService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService()
    this.tableService = tableService ?? new AsyncTableService()
    this.compressionService = compressionService ?? new CompressionService()
  }

  /**
   * Return a list of checks and the school UUID that need to be synchronised from the table storage marking tables to the SQL Database.
   * @private
   */
  private async getUnsynchronisedChecks (): Promise<UnsynchronisedCheck[]> {
    const sql = `
      SELECT 
        c.checkCode,
        s.urlSlug as schoolUUID
      FROM
        mtc_admin.[check] c JOIN
        mtc_admin.[pupil] p ON (c.pupil_id = p.id) JOIN
        mtc_admin.[school] s ON (p.school_id = s.id) JOIN 
        mtc_admin.[checkStatus] cs ON (c.checkStatus_id = cs.id)
      WHERE
        cs.code = 'CMP'
      AND
        c.resultsSynchronised = 0
      AND 
        c.isLiveCheck = 1
    `
    return this.sqlService.query(sql)
  }

  private async getReceivedCheck (check: UnsynchronisedCheck): Promise<ReceivedCheckTableEntity> {
    return this.tableService.retrieveEntityAsync(this.receivedCheckTableName, check.schoolUUID?.toLowerCase(), check.checkCode?.toLowerCase())
  }

  private expandArchive (check: UnsynchronisedCheck, archive: string): ValidatedCheck {
    if (archive === null || archive === undefined || archive === '') {
      throw new Error(`CheckCode ${check.checkCode} has an invalid archive`)
    }
    const payloadString = this.compressionService.decompress(archive)
    try {
      const payload: ValidatedCheck = JSON.parse(payloadString)
      return payload
    } catch (error) {
      throw new Error(`JSON.parse failed in expandArchive(): ERROR ${error.message}`)
    }
  }

  private tranformReceivedCheckToValidatedCheck (check: UnsynchronisedCheck, receivedCheck: ReceivedCheckTableEntity): ValidatedCheck {
    const archive = R.pathOr('', ['archive', '_'], receivedCheck)
    if (archive.length === 0) {
      throw new Error('Archive not found')
    }
    const validatedCheck = this.expandArchive(check, archive)
    return validatedCheck
  }

  private async getMarkedCheck (check: UnsynchronisedCheck): Promise<MarkedCheckTableEntity> {
    return this.tableService.retrieveEntityAsync(this.markedCheckTableName, check.schoolUUID?.toLowerCase(), check.checkCode?.toLowerCase())
  }

  private transformMarkedCheckEntityToMarkedCheck (check: UnsynchronisedCheck, markedCheckEntity: MarkedCheckTableEntity): MarkedCheck {
    let markedAnswers
    try {
      const markedAnswersString = R.pathOr('', ['markedAnswers', '_'], markedCheckEntity)
      markedAnswers = JSON.parse(markedAnswersString)
    } catch (error) {
      throw new Error(`Failed to parse JSON in transformMarkedCheckEntityToMarkedCheck(): Error: ${error.message}`)
    }
    const checkCode: null | string = R.pathOr(null, ['RowKey', '_'], markedCheckEntity)
    const mark: null | number = R.pathOr(null, ['mark', '_'], markedCheckEntity)
    const maxMarks: null | number = R.pathOr(null, ['maxMarks', '_'], markedCheckEntity)
    const markedAt: null | string = R.pathOr(null, ['markedAt', '_'], markedCheckEntity)

    if (checkCode === null) throw new Error('Missing checkCode field in markedCheckEntity')
    if (mark === null) throw new Error('Missing mark field in markedCheckEntity')
    if (maxMarks === null) throw new Error('Missing maxMarks field in markedCheckEntity')
    if (markedAt === null) throw new Error('Missing markedAt field in markedCheckEntity')

    const markedCheck: MarkedCheck = {
      checkCode,
      mark,
      maxMarks,
      markedAt,
      markedAnswers
    }
    return markedCheck
  }

  private async processCheck (check: UnsynchronisedCheck): Promise<ICheckCompletionMessage> {
    const receivedCheckPromise = this.getReceivedCheck(check)
    const markedCheckPromise = this.getMarkedCheck(check)
    const [receivedCheckEntity, markedCheckEntity] = await Promise.all([receivedCheckPromise, markedCheckPromise])
    const validatedCheck = this.tranformReceivedCheckToValidatedCheck(check, receivedCheckEntity)
    const markedCheck = this.transformMarkedCheckEntityToMarkedCheck(check, markedCheckEntity)

    return {
      validatedCheck: validatedCheck,
      markedCheck: markedCheck
    }
  }

  async getCheckDataMessages (): Promise<ICheckCompletionMessage[]> {
    const messages = []
    const checks = await this.getUnsynchronisedChecks()
    for (const check of checks) {
      this.logger.verbose(`${functionName} processing checkCode ${check.checkCode}`)
      try {
        const msg: ICheckCompletionMessage = await this.processCheck(check)
        messages.push(msg)
      } catch (error) {
        this.logger.error(`${functionName} failed to send sync message for checkCode ${check.checkCode} ERROR: ${error.message}`)
      }
    }
    return messages
  }
}
