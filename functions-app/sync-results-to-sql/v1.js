'use strict'

const base = require('../lib/logger')
const resultsService = require('./service/results.service.js')
const sqlService = require('../lib/sql/sql.service')
const name = 'sync-results-to-sql'
let questionHash

const service = {
  /**
   * Entry point for the module.
   * @return {Promise<{}>}
   */
  process: async function process (loggerFunc, checkCompletionMessage) {
    if (loggerFunc && typeof loggerFunc === 'function') {
      this.setLogger(loggerFunc)
      resultsService.setLogger(loggerFunc)
    }

    console.log('message received: ', checkCompletionMessage)
    console.log('markedAnswers', checkCompletionMessage.markedCheck.markedAnswers)

    this.logger.info(`${name}: message received for check [${checkCompletionMessage.markedCheck.checkCode}]`)

    // Retrieve the entire list of questions, and cache it.
    if (!questionHash) {
      console.info(`${name}: fetching question data`)
      questionHash = await resultsService.getQuestionData()
    }

    // Prepare checkResult insert statement
    const [checkResultSql, checkResultParams] = resultsService.prepareCheckResult(checkCompletionMessage.markedCheck)

    // Prepare SQL statements and variables for the Answers
    const [answersSql, answersParams] = resultsService.prepareAnswers(checkCompletionMessage.markedCheck, questionHash)

    // Persist everything to the DB in a single transaction
    return sqlService.modifyWithTransaction(checkResultSql.concat(answersSql), checkResultParams.concat(answersParams))
  }
}

module.exports = Object.assign(service, base)
