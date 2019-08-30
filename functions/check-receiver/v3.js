'use strict'

const moment = require('moment')

const v3 = {
  process: async function (context, receivedCheck) {
    // persist to receivedCheck table
    receivedCheck.checkReceivedAt = moment().toDate()
    context.bindings.receivedCheckTable = []
    context.bindings.receivedCheckTable.push(receivedCheck)
    // put message on validation queue
    const message = {
      checkCode: receivedCheck.checkCode,
      schoolUUID: receivedCheck.schoolUUID
    }
    context.bindings.checkValidationQueue = [message]
  }
}

module.exports = v3
