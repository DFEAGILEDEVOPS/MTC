'use strict'

const logger = require('../log.service').getLogger()
const pause = (duration) => new Promise(resolve => setTimeout(resolve, duration))
const util = require('util')
const R = require('ramda')

const sqlAzureTimeoutRetryPredicate = (error) => {
  if ({}.hasOwnProperty.call(error, 'name')) {
    return error.name === 'TimeoutError'
  }
  return false
}

const sqlAzureResourceLimitReachedPredicate = (error) => {
  if (error && {}.hasOwnProperty.call(error, 'number')) {
    // https://docs.microsoft.com/en-gb/azure/sql-database/troubleshoot-connectivity-issues-microsoft-azure-sql-database#resource-governance-errors
    return error.number === 10928
  }
  return false
}

const defaultRetryPredicate = () => false

const defaultConfiguration = {
  attempts: 3,
  pauseTimeMs: 5000,
  pauseMultiplier: 1.5
}

/**
 * @param {function} asyncRetryableFunction - the function to execute with retry behaviour
 * @param {object} retryConfiguration - the behaviour of the retry policy.  Default settings are provided
 * @param {function(Error):Boolean} retryPredicate - predicate function to determine if the function should be retried.  Defaults to true
 */
const asyncRetryHandler = async (asyncRetryableFunction, retryConfiguration = defaultConfiguration, retryPredicate = defaultRetryPredicate) => {
  const retryPolicy = {}
  try {
    Object.assign(retryPolicy, retryConfiguration)
    const result = await asyncRetryableFunction()
    return result
  } catch (error) {
    const attemptsLeft = retryPolicy.attempts
    const meetsRetryCondition = retryPredicate(error)
    logger.error(`asyncRetryHandler: error thrown '${error.message}'`)
    logger.error(tryParseErrorObjectToString(error))
    if (retryPolicy.attempts > 1 && retryPredicate(error)) {
      await pause(retryPolicy.pauseTimeMs)
      logger.info('asyncRetryHandler: re-attempting call')
      retryPolicy.attempts -= 1
      retryPolicy.pauseTimeMs *= retryConfiguration.pauseMultiplier
      const result = await asyncRetryHandler(asyncRetryableFunction, retryPolicy, retryPredicate)
      return result
    } else {
      logger.error(`asyncRetryHandler: giving up. attemptsLeft:${attemptsLeft},
      meetsCondition:${meetsRetryCondition},
      error.message:${error.message}`)
      logger.error(tryParseErrorObjectToString(error))
      throw error
    }
  }
}

function tryParseErrorObjectToString (error) {
  try {
    const reducedError = R.omit(['stack'], error)
    const errorAsString = util.inspect(reducedError, true)
    return `error object:\n${errorAsString}`
  } catch (e) {
    return `unable to parse error. reason:${e.message}`
  }
}

module.exports = {
  asyncRetryHandler,
  sqlAzureTimeoutRetryPredicate,
  sqlAzureResourceLimitReachedPredicate
}
