'use strict'

const azureStorage = require('azure-storage')

const azureStorageHelper = require('../../lib/azure-storage-helper')
const base = require('../../lib/logger')
const dataService = require('./data-access/data.service')
const MarkedCheck = require('../marked-check.class')
const redisCacheService = require('../../lib/redis-cache.service')
const redisKeyService = require('../../lib/redis-key.service')
const { TYPES } = require('../../lib/sql/sql.service')

const markingTable = 'checkResult'
const name = 'sync-results-to-sql'

const service = {
  // /**
  //  * Fetch checks for a school
  //  * @param {number} schoolId
  //  * @return {Promise<{id: number, checkCode: string}[]>}
  //  */
  // getNewChecks: async function getNewChecks (schoolId) {
  //   return dataService.sqlGetNewChecks(schoolId)
  // },

  // /**
  //  * Fetch indexed marking data from Table Storage `checkResult` table for a given school
  //  * @param guid
  //  * @return {Promise<MarkedCheck[]>}
  //  */
  // getSchoolResults: async function (guid) {
  //   const tableService = azureStorageHelper.getPromisifiedAzureTableService()
  //   const query = new azureStorage.TableQuery()
  //     .top(1000)
  //     .where('PartitionKey eq ? or PartitionKey eq ?', guid.toLowerCase(), guid.toUpperCase()) // accommodate any case
  //
  //   const result = await tableService.queryEntitiesAsync(markingTable, query, null) // TODO: jms add retry handling
  //
  //   const parsedEntities = result.result.entries.map(o => {
  //     return new MarkedCheck(o.RowKey._, guid, o.markedAnswers._, o.mark._, o.markedAt._)
  //   })
  //   return parsedEntities
  // },

  // /**
  //  * Get schools that have new checks to process
  //  * Defined as having completed checks in the DB, but where the marking data (checkScores table) is missing.
  //  * @return {Promise<{id: number, name: string, schoolGuid: string}>}
  //  */
  // getSchoolsWithNewChecks: async function getSchoolsWithNewChecks () {
  //   return dataService.sqlGetSchoolsWithNewChecks()
  // },

  // /**
  //  * Filter the new marked checks from all the marked checks
  //  * @param {{id:number, checkCode: string}[]} newChecks
  //  * @param {MarkedCheck[]} markedChecks
  //  * @return {MarkedCheck[]}
  //  */
  // findNewMarkedChecks: function findNewMarkedChecks (newChecks, markedChecks) {
  //   // Create a Map so we can lookup by checkCode efficiently
  //   const newCheckMap = new Map()
  //   newChecks.forEach(o => { newCheckMap.set(o.checkCode.toLowerCase(), 0) })
  //
  //   const filteredChecks = markedChecks.filter(o => {
  //     if (newCheckMap.has(o.checkCode.toLowerCase())) {
  //       newCheckMap.set(o.checkCode, 1)
  //       return true
  //     }
  //     return false
  //   })
  //
  //   newCheckMap.forEach((val, key) => {
  //     if (val === 0) {
  //       // this key was not present in the MarkedChecks - we don't have marking data for it
  //       this.logger.error(`${name}: ERROR: Marking data not found for checkCode ${key}`)
  //     }
  //   })
  //   return filteredChecks
  // },

  // /**
  //  * Calls the data-access layer to persist the marked checks
  //  * @param {MarkedCheck[]} markedChecks
  //  * @return {Promise<void>}
  //  */
  // persistMarkingData: async function persistMarkingData (markedChecks) {
  //   if (this.logger && typeof this.logger === 'function') {
  //     dataService.setLogger(this.logger)
  //   }
  //   return dataService.sqlPersistMarkingData(markedChecks)
  // },

  // /**
  //  * Drop Redis cache (school result data)
  //  * @param {Number} schoolId
  //  * @return {Promise<void>}
  //  */
  // dropCaches: async function dropCaches (schoolId) {
  //   const key = redisKeyService.getSchoolResultsKey(schoolId)
  //   await redisCacheService.drop(key)
  // }

  /**
   * Return an indexed object of all the questions 1x1 to 12x12 - includes warmup questions which are distinct
   * Data is cached once retrieved
   * @return {Promise<{object}>}  { '1x1': {id: 145, factor1: 1, factor2: 1, isWarmUp: false, code: 'Q001' }, ... }
   */
  getQuestionData: function sqlGetQuestionData () {
    return dataService.sqlGetQuestionData()
  },

  prepareCheckResult: function prepareCheckResult (markedCheck) {
    console.log('prepareCheckResult: ', markedCheck)
    const sql = `
        DECLARE @checkId Int;
        DECLARE @checkResultId Int;

        SET @checkId = (SELECT id
                          FROM mtc_admin.[check]
                         WHERE checkCode = @checkCode);
        IF (@checkId IS NULL) THROW 510001, 'Check ID not found', 1;

        INSERT INTO mtc_results.checkResult (check_id, mark, markedAt)
        VALUES (@checkId, @mark, @markedAt);

        SET @checkResultId = (SELECT SCOPE_IDENTITY());
    `
    const params = [
      { name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier },
      { name: 'mark', value: markedCheck.mark, type: TYPES.TinyInt },
      { name: 'markedAt', value: markedCheck.markedAt, type: TYPES.DateTimeOffset }
    ]
    return [sql, params]
  }
}

module.exports = Object.assign(service, base)
