'use strict'

const azureStorage = require('azure-storage')

const dataService = require('./data-access/data.service')
const azureStorageHelper = require('../../lib/azure-storage-helper')
const MarkedCheck = require('../marked-check.class')
const markingTable = 'checkResult'

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
      .where('PartitionKey eq ?', guid) // TODO: .toLowerCase()

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
    newChecks.forEach(o => { newCheckMap.set(o.checkCode, 1) })

    return markedChecks.filter(o => {
      if (newCheckMap.has(o.checkCode)) {
        return true
      }
      return false
    })
  },

  /**
   * Calls the data-access layer to persist the marked checks
   * @param {MarkedCheck[]} markedChecks
   * @return {Promise<void>}
   */
  persistMarkingData: async function persistMarkingData (markedChecks) {
    return dataService.sqlSaveMarkingData(markedChecks)
  }
}

module.exports = service
