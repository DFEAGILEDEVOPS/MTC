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
  },

  resyncChecksForSchool: async function resyncChecksForSchool (schoolUuid) {
    if (!schoolUuid) {
      throw new Error('schoolUuid parameter is required')
    }
    return dataService.callSyncResultsInitFunction({
      schoolUuid: schoolUuid
    })
  },

  resyncAllChecks: async function resyncChecks (resyncAll = false) {
    return dataService.callSyncResultsInitFunction({
      resyncAll: resyncAll
    })
  }
}

module.exports = service
