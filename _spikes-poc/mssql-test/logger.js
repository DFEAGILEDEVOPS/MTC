'use strict'
function log (msg, err = null)  { console.log(msg, err) }

const serviceToExport = {
  log: log,
  info: log,
  warn: log,
  debug: log,
  critical: log
}

module.exports = serviceToExport
