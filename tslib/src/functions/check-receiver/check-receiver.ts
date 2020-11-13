import { Context } from '@azure/functions'
import Moment from 'moment'
import * as az from '../../azure/storage-helper'
import { SubmittedCheckMessageV2, ReceivedCheckTableEntity, ValidateCheckMessageV1 } from '../../schemas/models'
import { CheckNotificationType, ICheckNotificationMessage } from '../../schemas/check-notification-message'
const tableService = new az.AsyncTableService()

export class CheckReceiver {
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

    const receivedMessage: ICheckNotificationMessage = {
      version: 1,
      checkCode: receivedCheck.checkCode,
      notificationType: CheckNotificationType.checkReceived
    }
    context.bindings.checkNotificationQueue = [receivedMessage]

    const message: ValidateCheckMessageV1 = {
      version: 1,
      checkCode: receivedCheck.checkCode.toLowerCase(),
      schoolUUID: receivedCheck.schoolUUID.toLowerCase()
    }
    context.bindings.checkValidationQueue = [message]
  }
}
