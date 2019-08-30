'use strict'

const compressionService = require('../lib/compression.service')
const checkSchema = require('../check-receiver/message-schema/message.v1.json')
const R = require('ramda')

const v1 = {
  process: async function (context, checkMetadata) {
    let receivedCheck = findReceivedCheck(context.bindings.receivedCheckTable)
    try {
      ensureArchiveExists(receivedCheck)
      context.log(`archive property exists`)
      const decompressedString = compressionService.decompress(receivedCheck.archive)
      const checkData = JSON.parse(decompressedString)
      validate(checkData, context)
    } catch (error) {
      // TODO update receivedCheck with processing error
      context.log.error(error.message)
      return
      // context.bindings.receivedCheckTable.validationError = error.message
      // return
    }
    // dispatch message to indicate ready for marking
    const markingMessage = {
      checkCode: checkMetadata.checkCode,
      schoolUUID: checkMetadata.schoolUUID
    }
    context.bindings.checkMarkingQueue = [markingMessage]
  }
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

function validate (check, context) {
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

function ensureArchiveExists (message) {
  if (!message.hasOwnProperty('archive')) {
    throw new Error(`Message is missing 'archive' property`)
  }
}

module.exports = v1
