'use strict'

const moment = require('moment')
const uuid = require('uuid/v4')

const v1 = require('./v1')
const compressionService = require('../lib/compression.service')
const functionName = 'completed-checks:v2'

function validate (message) {
  if (!message.hasOwnProperty('archive')) {
    throw new Error(`V2 Message is missing 'archive' property`)
  }
}

const v2 = {
  process: async function (context, completedCheckMessage) {
    validate(completedCheckMessage)
    context.log.info(`${functionName}: compressed message length: ${JSON.stringify(completedCheckMessage).length} bytes`)
    if (completedCheckMessage.length > 45000) {
      context.log.warn(`${functionName}: large compressed message received bigger than 45Kb: size is ${completedCheckMessage.length} bytes`)
    }
    const decompressedString = compressionService.decompress(completedCheckMessage.archive)
    if (!decompressedString) {
      throw new Error(`${functionName}: ERROR checkCode ${completedCheckMessage.checkCode}: unable to decompress archive`)
    }
    if (decompressedString.length > 45000) {
      context.log.warn(`${functionName}: large decompressed message received: size is ${decompressedString.length} bytes.`)
    }
    context.log.info(`${functionName}: decompressed message length: ${decompressedString.length} bytes`)
    const v1Message = JSON.parse(decompressedString)
    await v1.handleCompletedCheck(context, v1Message)
    // Default output is bound to the pupilEvents table (saved in table storage)
    context.bindings.pupilEventsTable = []
    // const base64EncodedPayload = Buffer.from(JSON.stringify(completedCheckMessage)).toString('base64')
    const entity = {
      PartitionKey: completedCheckMessage.checkCode,
      RowKey: uuid(),
      eventType: 'completed-check',
      payload: 'removed',
      processedAt: moment().toDate()
    }
    context.bindings.pupilEventsTable.push(entity)
  }
}

module.exports = v2
