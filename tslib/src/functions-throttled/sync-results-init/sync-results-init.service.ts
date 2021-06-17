import * as R from 'ramda'
import { parallelLimit } from 'async'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

import { ConsoleLogger, ILogger } from '../../common/logger'
import { ISqlService, SqlService } from '../../sql/sql.service'
import {
  MarkedCheck,
  ValidatedCheck
} from '../sync-results-to-sql/models'
import { IAsyncTableService, AsyncTableService } from '../../azure/storage-helper'
import { UnsynchronisedCheck } from './models'
import { MarkedCheckTableEntity, ReceivedCheckTableEntity } from '../../schemas/models'
import { CompressionService, ICompressionService } from '../../common/compression-service'
import config from '../../config'
import { Sender, ServiceBusClient } from '@azure/service-bus'

const functionName = 'sync-results-init: SyncResultsInitService'

export interface MetaResult {
  messagesSent: number
  messagesErrored: number
  totalChecks: number
  startTime: moment.Moment
}

export class SyncResultsInitService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService
  private readonly tableService: IAsyncTableService
  private readonly compressionService: ICompressionService
  private readonly receivedCheckTableName = 'receivedCheck'
  private readonly markedCheckTableName = 'checkResult'
  private readonly outputQueueName = 'check-completion'

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
        SELECT c.checkCode, s.urlSlug as schoolUUID
          FROM mtc_admin.[check] c
               JOIN mtc_admin.[pupil] p ON (c.pupil_id = p.id)
               JOIN mtc_admin.[school] s ON (p.school_id = s.id)
               JOIN mtc_admin.[checkStatus] cs ON (c.checkStatus_id = cs.id)
         WHERE cs.code = 'CMP'
           AND c.resultsSynchronised = 0
           AND c.isLiveCheck = 1
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

  private generateMessageId (check: UnsynchronisedCheck): string {
    if (process.env.NODE_ENV === 'production') {
      return check.checkCode
    }
    return uuidv4()
  }

  private logProgress (meta: MetaResult): void {
    const progressPercent = Math.round((meta.messagesSent / meta.totalChecks) * 100)
    const elapsedTimeMinutes = (moment.utc().valueOf() - meta.startTime.valueOf()) / 1000 / 60
    const ratePerMinute = Math.round(meta.messagesSent / elapsedTimeMinutes)
    const minutesRemaining = (meta.totalChecks - meta.messagesSent) / ratePerMinute
    const estFinishTime = moment.utc().add(minutesRemaining, 'minutes')
    this.logger.info(`${functionName} ${meta.messagesSent} checks done ${progressPercent}% complete in ${elapsedTimeMinutes} mins, rate is ${ratePerMinute} / minute, estimated completion at ${estFinishTime.toISOString()}`)
  }

  private async processCheck (check: UnsynchronisedCheck, sbSender: Sender, meta: MetaResult): Promise<void> {
    const receivedCheckPromise = this.getReceivedCheck(check)
    const markedCheckPromise = this.getMarkedCheck(check)
    const [receivedCheckEntity, markedCheckEntity] = await Promise.all([receivedCheckPromise, markedCheckPromise])
    const validatedCheck = this.tranformReceivedCheckToValidatedCheck(check, receivedCheckEntity)
    const markedCheck = this.transformMarkedCheckEntityToMarkedCheck(check, markedCheckEntity)

    const msg = {
      validatedCheck: validatedCheck,
      markedCheck: markedCheck
    }

    try {
      const msgId = this.generateMessageId(check)
      await sbSender.send({ body: msg, messageId: msgId, contentType: 'application/json' })
      meta.messagesSent += 1
      if (meta.messagesSent % 1000 === 0) { // Log every 1000 messages sent
        this.logProgress(meta)
      }
    } catch (error) {
      this.logger.error(`${functionName} failed to send sync message for checkCode ${check.checkCode} ERROR: ${error.message}`)
      meta.messagesErrored += 1
    }
  }

  async processBatch (): Promise<{ messagesSent: number, messagesErrored: number }> {
    if (config.ServiceBus.ConnectionString === undefined) {
      throw new Error('Missing config.ServiceBus.ConnectionString')
    }
    const sbClient = ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
    const sbQueueClient = sbClient.createQueueClient(this.outputQueueName)
    const sbSender = sbQueueClient.createSender()
    await sbSender.open()
    const checks = await this.getUnsynchronisedChecks()
    const meta: MetaResult = { totalChecks: checks.length, messagesSent: 0, messagesErrored: 0, startTime: moment.utc() }
    this.logger.info(`${functionName} ${meta.totalChecks} checks found to synchronise`)

    const listOfAsyncFunctions = checks.map(chk => {
      const _chk = chk
      return async () => {
        await this.processCheck(_chk, sbSender, meta)
      }
    })
    await parallelLimit(listOfAsyncFunctions, 5)
    await sbSender.close()
    await sbQueueClient.close()
    await sbClient.close()
    return meta
  }
}
