import { PreparedStatementError, TransactionError, ConnectionError, RequestError } from 'mssql'
const waitAsync = (milliSeconds: number) => new Promise(res => setTimeout(res, milliSeconds))

/**
 * @description function signature for retry condition implementations
 */
export interface IRetryPredicate {
  (error: Error): boolean
}

/**
 * default condition: do not retry
 */
export const defaultRetryCondition: IRetryPredicate = () => {
  return false
}

/**
 *
 * @description mssql specific predicate that will only signal for a retry if a timeout occured
 * @param {Error} error the error thrown that needs inspecting to determine whether a retry should be invoked
 */
export const sqlTimeoutRetryPredicate: IRetryPredicate = (error: Error) => {
  if (error instanceof ConnectionError ||
      error instanceof RequestError ||
      error instanceof PreparedStatementError ||
      error instanceof TransactionError) {
    if ({}.hasOwnProperty.call(error, 'code')) {
      return error.code === 'ETIMEOUT'
    }
  }
  return false
}

export interface IRetryStrategy {
  attempts: number
  pauseTimeMs: number
  pauseMultiplier: number
}

export const defaultRetryStrategy: IRetryStrategy = {
  attempts: 3,
  pauseTimeMs: 2500,
  pauseMultiplier: 1.5
}

/**
 * @param {function} asyncMethod - the function to execute with retry behaviour
 * @param {IRetryStrategy} retryStrategy - the behaviour of the retry policy.  Default settings are provided
 * @param {IRetryPredicate} retryPredicate - predicate function to determine if the function should be retried.  Defaults to true
 */
async function asyncRetryHandler<T> (asyncMethod: () => Promise<T>,
  retryStrategy: IRetryStrategy = defaultRetryStrategy,
  retryPredicate: IRetryPredicate = defaultRetryCondition): Promise<T> {
  let result: T
  try {
    result = await asyncMethod()
    return result
  } catch (error) {
    if (retryStrategy.attempts > 1 && retryPredicate(error)) {
      await waitAsync(retryStrategy.pauseTimeMs)
      retryStrategy.attempts --
      retryStrategy.pauseTimeMs *= retryStrategy.pauseMultiplier
      result = await asyncRetryHandler(asyncMethod, retryStrategy, retryPredicate)
    } else {
      throw error
    }
  }
  return result
}

export default asyncRetryHandler
