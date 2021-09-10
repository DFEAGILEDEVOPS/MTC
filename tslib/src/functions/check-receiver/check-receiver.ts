import { Context } from '@azure/functions'
import Moment from 'moment'
import * as az from '../../azure/storage-helper'
import { CheckNotificationType, ICheckNotificationMessage } from '../../schemas/check-notification-message'
import { SubmittedCheckMessageV2, ReceivedCheckTableEntity, ValidateCheckMessageV1 } from '../../schemas/models'
import { IBatchCheckNotifierDataService, BatchCheckNotifierDataService } from '../check-notifier-batch/batch-check-notifier.data.service'
const tableService = new az.AsyncTableService()

export class CheckReceiver {
  private readonly checkNotifierDataService: IBatchCheckNotifierDataService

  constructor (batchCheckNotifierDataService?: IBatchCheckNotifierDataService) {
    if (batchCheckNotifierDataService === undefined) {
      batchCheckNotifierDataService = new BatchCheckNotifierDataService()
    }
    this.checkNotifierDataService = batchCheckNotifierDataService
  }

  async process (context: Context, receivedCheck: SubmittedCheckMessageV2): Promise<void> {
    const receivedCheckEntity: ReceivedCheckTableEntity = {
      PartitionKey: receivedCheck.schoolUUID.toLowerCase(),
      RowKey: receivedCheck.checkCode.toLowerCase(),
      archive: receivedCheck.archive,
      checkReceivedAt: Moment().toDate(),
      checkVersion: +receivedCheck.version,
      processingError: ''
    }

    await tableService.insertEntityAsync('receivedCheck', receivedCheckEntity)

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
