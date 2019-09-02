import { Context } from "@azure/functions"
import { ICompleteCheckMessageV3 } from "../types/message-schemas"
import moment = require("moment");
//@ts-ignore
import azureStorageHelper from "../lib/azure-storage-helper"
const tableService = azureStorageHelper.getPromisifiedAzureTableService()

export class v3 {
  async process (context: Context, receivedCheck: ICompleteCheckMessageV3) {
    const entity = {
      PartitionKey: receivedCheck.schoolUUID,
      RowKey: receivedCheck.checkCode,
      archive: receivedCheck.archive,
      checkReceivedAt: moment().toDate(),
      messageVersion: receivedCheck.version
    }
    await tableService.insertEntityAsync('receivedCheck', entity)
    const message = {
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID,
      version: 1
    }
    context.bindings.checkValidationQueue = [message]
  }
}

export default new v3()
