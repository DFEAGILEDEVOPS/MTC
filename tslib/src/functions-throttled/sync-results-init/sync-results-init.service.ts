import * as R from 'ramda'
import { parallelLimit } from 'async'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { ServiceBusClient, type ServiceBusMessage, type ServiceBusSender } from '@azure/service-bus'

import { ConsoleLogger, type ILogger } from '../../common/logger'
import {
  type MarkedCheck,
  type ValidatedCheck
} from '../sync-results-to-sql/models'
import { type UnsynchronisedCheck } from './models'
import { type MarkedCheckTableEntity } from '../../schemas/models'
import { CompressionService, type ICompressionService } from '../../common/compression-service'
import config from '../../config'
import { SyncResultsInitDataService, type ISyncResultsInitDataService } from './sync-results-init-data.service'
import { type AzureTableEntity, type ITableService, TableService } from '../../azure/table-service'

const functionName = 'sync-results-init: SyncResultsInitService'

export interface MetaResult {
  messagesSent: number
  messagesErrored: number
  totalChecks: number
  startTime: moment.Moment
}

export interface ISyncResultsInitServiceOptions {
  schoolUuid?: string
  checkCode?: string
  resyncAll?: boolean
}

export class SyncResultsInitService {
  private readonly logger: ILogger
  private readonly dataService: ISyncResultsInitDataService
  private readonly tableService: ITableService
  private readonly compressionService: ICompressionService
  private readonly receivedCheckTableName = 'receivedCheck'
  private readonly markedCheckTableName = 'checkResult'
  private readonly outputQueueName = 'check-completion'

  constructor (logger?: ILogger, dataService?: ISyncResultsInitDataService, tableService?: ITableService, compressionService?: ICompressionService) {
    this.logger = logger ?? new ConsoleLogger()
    this.dataService = dataService ?? new SyncResultsInitDataService()
    this.tableService = tableService ?? new TableService()
    this.compressionService = compressionService ?? new CompressionService()
  }

  private async getReceivedCheck (check: UnsynchronisedCheck): Promise<AzureTableEntity> {
    const partitionKey = check.schoolUUID?.toLowerCase()
    const rowKey = check.checkCode?.toLowerCase()
    return this.tableService.getEntity(this.receivedCheckTableName, partitionKey, rowKey)
  }

  private expandArchive (check: UnsynchronisedCheck, archive: string, version: number): ValidatedCheck {
    if (archive === null || archive === undefined || archive === '') {
      throw new Error(`CheckCode ${check.checkCode} has an invalid archive`)
    }
    let payloadString = ''
    if (version === 2) {
      payloadString = this.compressionService.decompressFromUTF16(archive)
    } else if (version === 3) {
      payloadString = this.compressionService.decompressFromBase64(archive)
    } else if (version === 4) {
      payloadString = this.compressionService.decompressFromGzip(archive)
    }
    if (payloadString === '' || payloadString === null) {
      throw new Error('Decompressed receivedCheck archive payload is null or empty')
    }
    try {
      const payload: ValidatedCheck = JSON.parse(payloadString)
      return payload
    } catch (error: any) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      throw new Error(`JSON.parse failed in expandArchive(): ERROR ${errorMessage}`)
    }
  }

  private transformReceivedCheckToValidatedCheck (check: UnsynchronisedCheck, receivedCheck: AzureTableEntity): ValidatedCheck {
    const archive = R.pathOr('', ['archive'], receivedCheck)
    const version: string | undefined = R.pathOr(undefined, ['checkVersion'], receivedCheck)
    if (archive.length === 0) {
      throw new Error(`archive property not found.  checkCode:${check.checkCode}`)
    }
    if (version === undefined) {
      throw new Error(`receivedChck.checkVersion:${version} property not found.  checkCode:${check.checkCode}`)
    }
    const validatedCheck = this.expandArchive(check, archive, version)
    return validatedCheck
  }

  private async getMarkedCheck (check: UnsynchronisedCheck): Promise<any> {
    return this.tableService.getEntity(this.markedCheckTableName, check.schoolUUID?.toLowerCase(), check.checkCode?.toLowerCase())
  }

  private transformMarkedCheckEntityToMarkedCheck (check: UnsynchronisedCheck, markedCheckEntity: MarkedCheckTableEntity): MarkedCheck {
    let markedAnswers
    try {
      const markedAnswersString = R.pathOr('', ['markedAnswers'], markedCheckEntity)
      markedAnswers = JSON.parse(markedAnswersString)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      throw new Error(`Failed to parse JSON in transformMarkedCheckEntityToMarkedCheck(): Error: ${errorMessage}`)
    }
    const checkCode: null | string = R.pathOr(null, ['rowKey'], markedCheckEntity)
    const mark: null | number = R.pathOr(null, ['mark'], markedCheckEntity)
    const maxMarks: null | number = R.pathOr(null, ['maxMarks'], markedCheckEntity)
    const markedAt: null | string = R.pathOr(null, ['markedAt'], markedCheckEntity)

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

  private async processCheck (check: UnsynchronisedCheck, sbSender: ServiceBusSender, meta: MetaResult): Promise<void> {
    const receivedCheckPromise = this.getReceivedCheck(check)
    const markedCheckPromise = this.getMarkedCheck(check)
    const [receivedCheckEntity, markedCheckEntity] = await Promise.all([receivedCheckPromise, markedCheckPromise])
    const validatedCheck = this.transformReceivedCheckToValidatedCheck(check, receivedCheckEntity)
    const markedCheck = this.transformMarkedCheckEntityToMarkedCheck(check, markedCheckEntity)

    const messageBody = {
      validatedCheck,
      markedCheck
    }

    try {
      const msgId = this.generateMessageId(check)
      const message: ServiceBusMessage = {
        body: messageBody,
        messageId: msgId,
        contentType: 'application/json'
      }
      await sbSender.sendMessages(message)
      meta.messagesSent += 1
      if (meta.messagesSent % 1000 === 0) { // Log every 1000 messages sent
        this.logProgress(meta)
      }
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      this.logger.error(`${functionName} failed to send sync message for checkCode ${check.checkCode} ERROR: ${errorMessage}`)
      meta.messagesErrored += 1
    }
  }

  async processBatch (options: ISyncResultsInitServiceOptions): Promise<MetaResult> {
    if (config.ServiceBus.ConnectionString === undefined) {
      throw new Error('Missing config.ServiceBus.ConnectionString')
    }
    const sbClient = new ServiceBusClient(config.ServiceBus.ConnectionString)
    const sbSender = sbClient.createSender(this.outputQueueName)

    let checks: UnsynchronisedCheck[]
    if ('checkCode' in options && options.checkCode !== undefined) {
      this.logger.info(`${functionName} resynchronising a single check`)
      checks = await this.dataService.getCheckToResynchronise(options.checkCode)
    } else if ('schoolUuid' in options && options.schoolUuid !== undefined) {
      this.logger.info(`${functionName} resynchronising all checks for a school`)
      checks = await this.dataService.getSchoolToResynchonise(options.schoolUuid)
    } else if ('resyncAll' in options && options.resyncAll === true) {
      this.logger.info(`${functionName} resynchronising all valid checks`)
      checks = await this.dataService.getAllChecksToResynchronise()
    } else {
      // standard run: find all unsynchronised checks where the `resultsSynchronised` flag is false
      this.logger.info(`${functionName} resynchronising outstanding checks (default)`)
      checks = await this.dataService.getUnsynchronisedChecks()
    }

    const meta: MetaResult = { totalChecks: checks.length, messagesSent: 0, messagesErrored: 0, startTime: moment.utc() }
    this.logger.info(`${functionName} ${meta.totalChecks} checks found to synchronise via $options ${JSON.stringify(options)}`)

    const listOfAsyncFunctions = checks.map(chk => {
      const _chk = chk
      return async () => {
        await this.processCheck(_chk, sbSender, meta)
      }
    })
    await parallelLimit(listOfAsyncFunctions, config.SyncResultsInit.MaxParallelTasks)
    await sbSender.close()
    await sbClient.close()
    return meta
  }
}
