import { Context } from "@azure/functions"
import { ICompleteCheckMessage } from "./types/schemas"
import moment = require("moment");
//@ts-ignore
import azureStorageHelper from "../../functions/lib/azure-storage-helper"
const tableService = azureStorageHelper.getPromisifiedAzureTableService()

export class v3 {
  async process (context: Context, receivedCheck: ICompleteCheckMessage) {
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
