'use strict'

const compressionService = require('../lib/compression.service')
const checkSchema = require('../check-receiver/message-schema/message.v1.json')
const R = require('ramda')
const moment = require('moment')
const azureStorageHelper = require('../lib/azure-storage-helper')
const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()

const v1 = {
  process: async function (context, checkMetadata) {
    let receivedCheck = findReceivedCheck(context.bindings.receivedCheckTable)
    try {
      detectArchive(receivedCheck)
      const decompressedString = compressionService.decompress(receivedCheck.archive)
      const checkData = JSON.parse(decompressedString)
      validateArchive(checkData, context)
    } catch (error) {
      updateReceivedCheckWithErrorDetails(error.message, receivedCheck)
      context.log.error(error.message)
      return
    }
    updateReceivedCheckWithValidationTimestamp(receivedCheck)
    // dispatch message to indicate ready for marking
    const markingMessage = {
      checkCode: checkMetadata.checkCode,
      schoolUUID: checkMetadata.schoolUUID
    }
    context.bindings.checkMarkingQueue = [markingMessage]
  }
}

async function updateReceivedCheckWithValidationTimestamp (receivedCheck) {
  receivedCheck.validatedAt = moment().toDate()
  receivedCheck.isValid = true
  await azureTableService.replaceEntityAsync('receivedCheck', receivedCheck)
}

async function updateReceivedCheckWithErrorDetails (errorMessage, receivedCheck) {
  receivedCheck.validationError = errorMessage
  receivedCheck.validatedAt = moment().toDate()
  receivedCheck.isValid = false
  await azureTableService.replaceEntityAsync('receivedCheck', receivedCheck)
}

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

function validateArchive (check, context) {
  // get top level properties of message schema as an array
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

function detectArchive (message) {
  if (!message.hasOwnProperty('archive')) {
    throw new Error(`Message is missing 'archive' property`)
  }
}

module.exports = v1
