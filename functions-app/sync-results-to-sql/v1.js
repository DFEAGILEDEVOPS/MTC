'use strict'

const base = require('../lib/logger')
const resultsService = require('./service/results.service.js')
const sqlService = require('../lib/sql/sql.service')
const name = 'sync-results-to-sql'

const service = {
  // /**
  //  * Process a school - fetch the data from Table Storage and save it in SQL DB
  //  * @param {id: number, name: string, schoolGuid: string} school
  //  * @return {Promise<Number>}
  //  */
  // processSchool: async function processSchool (school) {
  //   // Find all outstanding checks in the school
  //   const newChecks = await resultsService.getNewChecks(school.id)
  //
  //   // Retrieve the entire schools marking data from Table Storage, for new and old checks
  //   const markedChecks = await resultsService.getSchoolResults(school.schoolGuid)
  //
  //   // Filter the marking data to only the new checks we need
  //   const newMarkedChecks = await resultsService.findNewMarkedChecks(newChecks, markedChecks)
  //
  //   await resultsService.persistMarkingData(newMarkedChecks)
  //
  //   // Invalidate caches: e.g. school result data
  //   await resultsService.dropCaches(school.id)
  //
  //   return newChecks.length
  // },

  /**
   * Entry point for the module.
   * @return {Promise<{}>}
   */
  process: async function process (loggerFunc, checkCompletionMessage) {
    if (loggerFunc && typeof loggerFunc === 'function') {
      this.setLogger(loggerFunc)
      resultsService.setLogger(loggerFunc)
    }
    console.log('message received', checkCompletionMessage)

    // const questionHash = await resultsService.getQuestionData()

    // Prepare checkResult insert statement
    const [checkResultSql, checkResultParams] = resultsService.prepareCheckResult(checkCompletionMessage.markedCheck)

    // Prepare SQL statements and variables for the Answers
    // const { answersSql, answersVar } = await resultsService.prepareAnswers(checkCompletionMessage.markedAnswer, questionHash)

    const res = await sqlService.modifyWithTransaction(checkResultSql, checkResultParams)
    console.log('RES', res)

    return {}
  }
}

module.exports = Object.assign(service, base)
