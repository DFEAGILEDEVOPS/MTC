const uuid = require('uuid/v4')
const moment = require('moment')

module.exports = function (context, check) {
  context.log('complete check found on queue:', check.access_token)
  // perform work here, such as updating check entry in admin system
  context.bindings.table = []
  const entity = {
    PartitionKey: check.pupil.checkCode,
    RowKey: uuid(),
    payload: JSON.stringify(check),
    processedAt: moment().toDate(),
    processedBy: 'azure function'
  }
  context.bindings.table.push(entity)
  context.done()
}
