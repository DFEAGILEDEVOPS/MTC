import { type InvocationContext } from '@azure/functions'
import { TableService } from '../../azure/table-service.js'
import Moment from 'moment'
import { CheckNotificationType, type ICheckNotificationMessage } from '../../schemas/check-notification-message.js'
import { type SubmittedCheckMessage, type ValidateCheckMessageV1, type ReceivedCheckTableEntity } from '../../schemas/models.js'
import { type IBatchCheckNotifierDataService, BatchCheckNotifierDataService } from '../check-notifier-batch/batch-check-notifier.data.service.js'
import { ConsoleLogger, type ILogger } from '../../common/logger.js'
import { CompressionService } from '../../common/compression-service.js'
import { CheckStartedDataService, type ICheckStartedDataService } from '../check-started/check-started.data.service.js'
const tableService = new TableService()

export class CheckReceiverServiceBus {
  private readonly checkNotifierDataService: IBatchCheckNotifierDataService
  private readonly logService: ILogger
  private readonly checkStartedDataService: ICheckStartedDataService

  constructor (batchCheckNotifierDataService?: IBatchCheckNotifierDataService, logger?: ILogger, checkStartedDataService?: ICheckStartedDataService) {
    this.logService = logger ?? new ConsoleLogger()
    this.checkNotifierDataService = batchCheckNotifierDataService ?? new BatchCheckNotifierDataService(this.logService)
    this.checkStartedDataService = checkStartedDataService ?? new CheckStartedDataService()
  }

  async process (context: InvocationContext, receivedCheck: SubmittedCheckMessage): Promise<ICheckReceiverOutputs> {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      partitionKey: receivedCheck.schoolUUID.toLowerCase(),
      rowKey: receivedCheck.checkCode.toLowerCase(),
      archive: receivedCheck.archive,
      checkReceivedAt: Moment().toDate(),
      checkVersion: +receivedCheck.version,
      processingError: ''
    }

    await tableService.createEntity('receivedCheck', receivedCheckEntity)
    await this.applyStartedAtFallback(context, receivedCheck)
    // as per #48506 - check-receiver will now handle this event instead of check-notifier-batch
    const request = this.checkNotifierDataService.createCheckReceivedRequest(receivedCheck.checkCode.toLowerCase())
    const output: ICheckReceiverOutputs = {
      checkNotificationQueue: [],
      checkValidationQueue: []
    }

    try {
      await this.checkNotifierDataService.executeRequestsInTransaction([request])
    } catch {
      context.error(`check-receiver: failed to write check received notification to database for check ${receivedCheck.checkCode}\n Falling back to check notification queue message.`)
      const receivedMessage: ICheckNotificationMessage = {
        version: 1,
        checkCode: receivedCheck.checkCode,
        notificationType: CheckNotificationType.checkReceived
      }
      output.checkNotificationQueue = [receivedMessage]
    }

    const message: ValidateCheckMessageV1 = {
      version: 1,
      checkCode: receivedCheck.checkCode.toLowerCase(),
      schoolUUID: receivedCheck.schoolUUID.toLowerCase()
    }
    output.checkValidationQueue = [message]
    return output
  }

  private async applyStartedAtFallback (context: InvocationContext, receivedCheck: SubmittedCheckMessage): Promise<void> {
    try {
      const parsedCheck = this.getParsedSubmittedCheckPayload(receivedCheck)
      const startedAt = parsedCheck?.audit?.find((event: { type?: string, clientTimestamp?: string, browserTimestamp?: string }) => event?.type === 'CheckStarted')?.clientTimestamp ??
        parsedCheck?.audit?.find((event: { type?: string, clientTimestamp?: string, browserTimestamp?: string }) => event?.type === 'CheckStarted')?.browserTimestamp

      if (startedAt !== undefined && startedAt !== null && startedAt !== '') {
        await this.checkStartedDataService.updateCheckStartedDate(receivedCheck.checkCode, new Date(startedAt))
      }
    } catch (error) {
      context.warn(`check-receiver: unable to apply startedAt fallback for check ${receivedCheck.checkCode}: ${String(error)}`)
    }
  }

  private getParsedSubmittedCheckPayload (receivedCheck: SubmittedCheckMessage): any {
    const compressionService = new CompressionService()
    let payloadString = ''

    if (receivedCheck.version === 2) {
      payloadString = compressionService.decompressFromUTF16(receivedCheck.archive)
    } else if (receivedCheck.version === 3) {
      payloadString = compressionService.decompressFromBase64(receivedCheck.archive)
    } else {
      payloadString = compressionService.decompressFromGzip(receivedCheck.archive)
    }

    return JSON.parse(payloadString)
  }
}

export interface ICheckReceiverOutputs {
  checkValidationQueue: ValidateCheckMessageV1[]
  checkNotificationQueue: ICheckNotificationMessage[]
}
