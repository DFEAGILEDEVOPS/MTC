'use strict'

const moment = require('moment')

module.exports = async function (context, completedCheck) {
  context.bindings.receivedCheckTable = []
  const entity = {
    PartitionKey: completedCheck.schoolUUID,
    RowKey: completedCheck.checkCode,
    archive: completedCheck.archive,
    receivedAt: moment().toDate()
  }
  context.bindings.receivedCheckTable.push(entity)
}
