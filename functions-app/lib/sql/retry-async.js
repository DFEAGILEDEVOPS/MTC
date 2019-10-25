'use strict'
const config = require('../../config')

const pause = (duration) => new Promise(res => setTimeout(res, duration), noReject => undefined)
const defaultRetryPredicate = () => true

const defaultConfiguration = {
  attempts: config.DatabaseRetry.MaxRetryAttempts,
  pauseTimeMs: config.DatabaseRetry.InitialPauseMs,
  pauseMultiplier: config.DatabaseRetry.PauseMultiplier
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
    if (retryPolicy.attempts > 1 && retryPredicate(error)) {
      await pause(retryPolicy.pauseTimeMs)
      retryPolicy.attempts -= 1
      retryPolicy.pauseTimeMs *= retryConfiguration.pauseMultiplier
      const result = await asyncRetryHandler(asyncRetryableFunction, retryPolicy, retryPredicate)
      return result
    } else {
      throw error
    }
  }
}

module.exports = asyncRetryHandler
