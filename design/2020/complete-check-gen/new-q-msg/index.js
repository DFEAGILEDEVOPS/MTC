'use strict'

const lz = require('lz-string')
const uuid = require('uuid/v4')
const checkMessage = require('../complete-check-message-template.json')
const largeCompleteCheck = require('../example-large-complete-check.json')

module.exports = (context, req) => {
  const message = JSON.parse(JSON.stringify(checkMessage))
  message.checkCode = uuid()
  message.schoolUUID = uuid()
  delete largeCompleteCheck.answers
  const archive = lz.compressToUTF16(JSON.stringify(largeCompleteCheck))
  message.archive = archive
  context.bindings.completeCheckQueue = [ message ]
  context.done()
}
