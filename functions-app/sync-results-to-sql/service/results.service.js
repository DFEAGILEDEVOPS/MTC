'use strict'

const azureStorage = require('azure-storage')

const azureStorageHelper = require('../../lib/azure-storage-helper')
const base = require('../../lib/logger')
const dataService = require('./data-access/data.service')
const MarkedCheck = require('../marked-check.class')
const markingTable = 'checkResult'
const name = 'sync-results-to-sql'

const service = {
  /**
   * Fetch checks for a school
   * @param {number} schoolId
   * @return {Promise<{id: number, checkCode: string}[]>}
   */
  getNewChecks: async function getNewChecks (schoolId) {
    return dataService.sqlGetNewChecks(schoolId)
  },

  /**
   * Fetch indexed marking data from Table Storage `checkResult` table for a given school
   * @param guid
   * @return {Promise<MarkedCheck[]>}
   */
  getSchoolResults: async function (guid) {
    const tableService = azureStorageHelper.getPromisifiedAzureTableService()
    const query = new azureStorage.TableQuery()
      .top(1000)
      .where('PartitionKey eq ? or PartitionKey eq ?', guid.toLowerCase(), guid.toUpperCase()) // accommodate any case

    const result = await tableService.queryEntitiesAsync(markingTable, query, null) // TODO: jms add retry handling

    const parsedEntities = result.result.entries.map(o => {
      return new MarkedCheck(o.RowKey._, guid, o.markedAnswers._, o.mark._, o.markedAt._)
    })
    return parsedEntities
  },

  /**
   * Get schools that have new checks to process
   * Defined as having completed checks in the DB, but where the marking data (checkScores table) is missing.
   * @return {Promise<{id: number, name: string, schoolGuid: string}>}
   */
  getSchoolsWithNewChecks: async function getSchoolsWithNewChecks () {
    return dataService.sqlGetSchoolsWithNewChecks()
  },

  /**
   * Filter the new marked checks from all the marked checks
   * @param {{id:number, checkCode: string}[]} newChecks
   * @param {MarkedCheck[]} markedChecks
   * @return {MarkedCheck[]}
   */
  findNewMarkedChecks: function findNewMarkedChecks (newChecks, markedChecks) {
    // Create a Map so we can lookup by checkCode efficiently
    const newCheckMap = new Map()
    newChecks.forEach(o => { newCheckMap.set(o.checkCode.toLowerCase(), 0) })

    const filteredChecks = markedChecks.filter(o => {
      if (newCheckMap.has(o.checkCode.toLowerCase())) {
        newCheckMap.set(o.checkCode, 1)
        return true
      }
      return false
    })

    newCheckMap.forEach((val, key) => {
      if (val === 0) {
        // this key was not present in the MarkedChecks - we don't have marking data for it
        this.logger.error(`${name}: ERROR: Marking data not found for checkCode ${key}`)
      }
    })
    return filteredChecks
  },

  /**
   * Calls the data-access layer to persist the marked checks
   * @param {MarkedCheck[]} markedChecks
   * @return {Promise<void>}
   */
  persistMarkingData: async function persistMarkingData (markedChecks) {
    if (this.logger && typeof this.logger === 'function') {
      dataService.setLogger(this.logger)
    }
    return dataService.sqlPersistMarkingData(markedChecks)
  }
}

module.exports = Object.assign(service, base)
