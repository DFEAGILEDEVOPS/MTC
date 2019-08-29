'use strict'

const lz = require('lz-string')
const checkMessage = require('../complete-check-message-template.json')
const largeCompleteCheck = require('../example-large-complete-check.json')

module.exports = (context, req) => {
  const archive = lz.compress(largeCompleteCheck)
  checkMessage.archive = archive
  context.bindings.completeCheckQueue = [ checkMessage ]
  context.done()
}
