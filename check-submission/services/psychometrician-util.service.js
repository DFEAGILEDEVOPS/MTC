'use strict'

const psUtilService = {}

psUtilService.getClientTimestampFromAuditEvent = function (auditEventType, completedCheck) {
  const logEntries = completedCheck.data.audit.filter(logEntry => logEntry.type === auditEventType)
  if (!logEntries.length) {
    return 'error'
  }
  const logEntry = logEntries[0]
  if (!logEntry.hasOwnProperty('clientTimestamp')) {
    return 'error'
  }
  return logEntry.clientTimestamp
}

module.exports = psUtilService
