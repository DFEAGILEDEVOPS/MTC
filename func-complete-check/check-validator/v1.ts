import { Context } from "@azure/functions"
import { ICompleteCheckMessageV3 } from "../types/message-schemas"
import moment = require("moment");
// import * as R from "ramda"
// import compressionService from "../lib/compression-service"
//@ts-ignore
import azureStorageHelper from "../lib/azure-storage-helper"
const tableService = azureStorageHelper.getPromisifiedAzureTableService()
// import checkSchema from "../message-schemas/complete-check.v1.json"

export class v1 {
  async process (context: Context, receivedCheck: ICompleteCheckMessageV3) {
    try {
      this.detectArchive(receivedCheck)
      // const decompressedString = compressionService.decompress(receivedCheck.archive)
      // const checkData = JSON.parse(decompressedString)
      // validateArchive(checkData, context)
    } catch (error) {
      await this.updateReceivedCheckWithErrorDetails(error.message, receivedCheck)
      context.log.error(error.message)
      return
    }
    await this.updateReceivedCheckWithValidationTimestamp(receivedCheck)
    // dispatch message to indicate ready for marking
    const markingMessage = {
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID
    }

    context.bindings.checkMarkingQueue = [markingMessage]
  }

  private async updateReceivedCheckWithValidationTimestamp (receivedCheck) {
    receivedCheck.validatedAt = moment().toDate()
    receivedCheck.isValid = true
    await tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }

  private async updateReceivedCheckWithErrorDetails (errorMessage, receivedCheck) {
    receivedCheck.validationError = errorMessage
    receivedCheck.validatedAt = moment().toDate()
    receivedCheck.isValid = false
    await tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }

  private detectArchive (message) {
    if (!message.hasOwnProperty('archive')) {
      throw new Error(`Message is missing 'archive' property`)
    }
  }
}

/* function validateArchive (check, context) {
  // get top level properties of message schema as an array
  //@ts-ignore
  const allProperties = Object.getOwnPropertyNames(checkSchema)
  const requiredProperties = R.without(['version'], allProperties)
  for (let index = 0; index < requiredProperties.length; index++) {
    const propertyName = requiredProperties[index]
    context.log(`validating property ${propertyName}`)
    if (!check.hasOwnProperty(propertyName)) {
      throw new Error(`check is missing ${propertyName} property`)
    }
  }
} */

export default new v1()
