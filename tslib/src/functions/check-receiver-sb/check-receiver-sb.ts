import { type InvocationContext } from '@azure/functions'
import { TableService } from '../../azure/table-service'
import Moment from 'moment'
import { CheckNotificationType, type ICheckNotificationMessage } from '../../schemas/check-notification-message'
import { type SubmittedCheckMessage, type ValidateCheckMessageV1, type ReceivedCheckTableEntity } from '../../schemas/models'
import { type IBatchCheckNotifierDataService, BatchCheckNotifierDataService } from '../check-notifier-batch/batch-check-notifier.data.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
const tableService = new TableService()

export class CheckReceiverServiceBus {
  private readonly checkNotifierDataService: IBatchCheckNotifierDataService
  private readonly logService: ILogger

  constructor (batchCheckNotifierDataService?: IBatchCheckNotifierDataService, logger?: ILogger) {
    this.logService = logger ?? new ConsoleLogger()
    this.checkNotifierDataService = batchCheckNotifierDataService ?? new BatchCheckNotifierDataService(this.logService)
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
}

export interface ICheckReceiverOutputs {
  checkValidationQueue: ValidateCheckMessageV1[]
  checkNotificationQueue: ICheckNotificationMessage[]
}
