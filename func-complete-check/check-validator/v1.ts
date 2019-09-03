import { Context } from "@azure/functions"
import { ValidateCheckMessage, ReceivedCheck, MarkCheckMessage } from "../types/message-schemas"
import moment = require("moment");
import * as R from "ramda"
import compressionService from "../lib/compression-service"
//@ts-ignore
import azureStorageHelper from "../lib/azure-storage-helper"
const tableService = azureStorageHelper.getPromisifiedAzureTableService()
import checkSchema from "../message-schemas/complete-check.v1.json"

class v1 {
  async process (context: Context, validateCheckMessage: ValidateCheckMessage) {
    let receivedCheck = findReceivedCheck(context.bindings.receivedCheckTable)
    try {
      detectArchive(receivedCheck)
      const decompressedString = compressionService.decompress(receivedCheck.archive)
      const checkData = JSON.parse(decompressedString)
      validateArchive(checkData, context)
    } catch (error) {
      await updateReceivedCheckWithErrorDetails(error.message, receivedCheck)
      context.log.error(error.message)
      return
    }
    await updateReceivedCheckWithValidationTimestamp(receivedCheck)
    // dispatch message to indicate ready for marking
    const markingMessage: MarkCheckMessage = {
      checkCode: receivedCheck.RowKey,
      schoolUUID: receivedCheck.PartitionKey,
      version: "1"
    }

    context.bindings.checkMarkingQueue = [markingMessage]
  }
}
// TODO strongly type the inputs and outputs
function findReceivedCheck (receivedCheckRef) {
  if (!receivedCheckRef) {
    throw new Error('received check reference is undefined')
  }
  if (!Array.isArray(receivedCheckRef)) {
    throw new Error(`received check reference was not an array`)
  }
  if (receivedCheckRef.length === 0) {
    throw new Error('received check reference is empty')
  }
  return receivedCheckRef[0]
}

async function updateReceivedCheckWithValidationTimestamp (receivedCheck) {
  receivedCheck.validatedAt = moment().toDate()
  receivedCheck.isValid = true
  await tableService.replaceEntityAsync('receivedCheck', receivedCheck)
}

async function updateReceivedCheckWithErrorDetails (errorMessage, receivedCheck) {
  receivedCheck.validationError = errorMessage
  receivedCheck.validatedAt = moment().toDate()
  receivedCheck.isValid = false
  await tableService.replaceEntityAsync('receivedCheck', receivedCheck)
}

function detectArchive (message) {
  // TODO use same pattern as validateArchive()?
  if (!message.hasOwnProperty('archive')) {
    throw new Error(`message is missing 'archive' property`)
  }
}

function validateArchive (check, context) {
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
}

export default new v1()
