import { Context } from "@azure/functions"
import { CompleteCheckMessageV3, ValidateCheckMessage, ReceivedCheck } from "../types/message-schemas"
import moment = require("moment");
//@ts-ignore
import azureStorageHelper from "../lib/azure-storage-helper"
const tableService = azureStorageHelper.getPromisifiedAzureTableService()

class v3 {
  async process (context: Context, receivedCheck: CompleteCheckMessageV3) {
    const receivedCheckEntity : ReceivedCheck = {
      PartitionKey: receivedCheck.schoolUUID,
      RowKey: receivedCheck.checkCode,
      archive: receivedCheck.archive,
      checkReceivedAt: moment().toDate(),
      checkVersion: +receivedCheck.version
    }
    await tableService.insertEntityAsync('receivedCheck', receivedCheckEntity)
    const message : ValidateCheckMessage = {
      version: "1",
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID
    }
    context.bindings.checkValidationQueue = [message]
  }
}

export default new v3()
