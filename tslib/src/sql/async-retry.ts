import { PreparedStatementError, TransactionError, ConnectionError, RequestError } from 'mssql'
type MsSqlErrorType = ConnectionError | RequestError | PreparedStatementError | TransactionError

const pause = (milliSeconds: number) => new Promise(res => setTimeout(res, milliSeconds))

const defaultRetryCondition = (error: MsSqlErrorType) => {
  if (error.hasOwnProperty('code')) {
    return error.code === 'ETIMEOUT'
  }
  return false
}

const defaultConfiguration: IRetryPolicy = {
  attempts: 3,
  pauseTimeMs: 5000,
  pauseMultiplier: 1.5
}

export interface IRetryPolicy {
  attempts: number
  pauseTimeMs: number
  pauseMultiplier: number
}

/**
 * @param {function} asyncRetryableFunction - the function to execute with retry behaviour
 * @param {object} retryConfiguration - the behaviour of the retry policy.  Default settings are provided
 * @param {function(Error):Boolean} retryCondition - predicate function to determine if the function should be retried.  Defaults to true
 */
async function asyncRetryHandler<T> (asyncRetryableFunction: () => Promise<T>,
  retryConfiguration: IRetryPolicy = defaultConfiguration,
  retryCondition: (error: MsSqlErrorType) => Boolean = defaultRetryCondition): Promise<T> {
  let result: T
  try {
    result = await asyncRetryableFunction()
    return result
  } catch (error) {
    if (retryConfiguration.attempts > 1 && retryCondition(error)) {
      await pause(retryConfiguration.pauseTimeMs)
      retryConfiguration.attempts --
      retryConfiguration.pauseTimeMs *= retryConfiguration.pauseMultiplier
      result = await asyncRetryHandler(asyncRetryableFunction, retryConfiguration, retryCondition)
    } else {
      throw error
    }
  }
  return result
}

export default asyncRetryHandler
