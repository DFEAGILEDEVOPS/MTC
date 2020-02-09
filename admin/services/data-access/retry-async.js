'use strict'

const logger = require('../log.service').getLogger()
const pause = (duration) => new Promise(resolve => setTimeout(resolve, duration))

const sqlTimeoutRetryPredicate = (error) => {
  if ({}.hasOwnProperty.call(error, 'code')) {
    return error.code === 'ETIMEOUT'
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
    logger.warn(`asyncRetryHandler: error thrown ${error.message}`)
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
    const formattedErrorObject = JSON.stringify(error, null, 2)
    return `error object:\n${formattedErrorObject}`
  } catch (e) {
    return `unable to parse error:${e.message}`
  }
}

module.exports = {
  asyncRetryHandler,
  sqlTimeoutRetryPredicate
}
