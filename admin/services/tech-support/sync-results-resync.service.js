'use strict'

const dataService = require('../data-access/sync-results-resync.data.service')

const service = {
  resyncSingleCheck: async function resyncSingleCheck (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode parameter is required')
    }
    return dataService.callSyncResultsInitFunction({
      checkCode: checkCode
    })
  }
}

module.exports = service
