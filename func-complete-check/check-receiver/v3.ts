import { Context } from '@azure/functions'
import { SubmittedCheckMessageV3, ValidateCheckMessageV1, ReceivedCheck } from '../typings/message-schemas'
import Moment from 'moment'
import azureStorageHelper from '../lib/azure-storage-helper'
const tableService = azureStorageHelper.getPromisifiedAzureTableService()

class V3 {
  async process (context: Context, receivedCheck: SubmittedCheckMessageV3) {
    const receivedCheckEntity: ReceivedCheck = {
      PartitionKey: receivedCheck.schoolUUID,
      RowKey: receivedCheck.checkCode,
      archive: receivedCheck.archive,
      checkReceivedAt: Moment().toDate(),
      checkVersion: +receivedCheck.version
    }
    await tableService.insertEntityAsync('receivedCheck', receivedCheckEntity)
    const message: ValidateCheckMessageV1 = {
      version: 1,
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID
    }
    context.bindings.checkValidationQueue = [message]
  }
}

export default new V3()
