import { type Context } from '@azure/functions'
import { TableService } from '../../azure/table-service'
import Moment from 'moment'
import { CheckNotificationType, type ICheckNotificationMessage } from '../../schemas/check-notification-message'
import { type SubmittedCheckMessageV3, type ReceivedCheckTableEntityV2, type ValidateCheckMessageV1 } from '../../schemas/models'
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

  async process (context: Context, receivedCheck: SubmittedCheckMessageV3): Promise<void> {
    const receivedCheckEntity: ReceivedCheckTableEntityV2 = {
      partitionKey: receivedCheck.schoolUUID.toLowerCase(),
      rowKey: receivedCheck.checkCode.toLowerCase(),
      payload: receivedCheck,
      checkReceivedAt: Moment().toDate(),
      checkVersion: +receivedCheck.version,
      processingError: ''
    }

    await tableService.createEntity('receivedCheck', receivedCheckEntity)

    // as per #48506 - check-receiver will now handle this event instead of check-notifier-batch
    const request = this.checkNotifierDataService.createCheckReceivedRequest(receivedCheck.checkCode.toLowerCase())

    try {
      await this.checkNotifierDataService.executeRequestsInTransaction([request])
    } catch (error) {
      context.log.error(`check-receiver: failed to write check received notification to database for check ${receivedCheck.checkCode}\n Falling back to check notification queue message.`)
      const receivedMessage: ICheckNotificationMessage = {
        version: 1,
        checkCode: receivedCheck.checkCode,
        notificationType: CheckNotificationType.checkReceived
      }
      context.bindings.checkNotificationQueue = [receivedMessage]
    }

    const message: ValidateCheckMessageV1 = {
      version: 1,
      checkCode: receivedCheck.checkCode.toLowerCase(),
      schoolUUID: receivedCheck.schoolUUID.toLowerCase()
    }
    context.bindings.checkValidationQueue = [message]
  }
}
