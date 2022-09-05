const waitAsync = async (milliSeconds: number): Promise<any> => new Promise((resolve) => setTimeout(resolve, milliSeconds))

/**
 * @description function signature for retry condition implementations
 */
export type IRetryPredicate = (error: Error) => boolean

/**
 * default condition: do not retry
 */
export const defaultRetryCondition: IRetryPredicate = () => {
  return false
}

/**
 * @description TODO
 * @param error
 * @returns
 */
export const sqlAzureTimeoutRetryPredicate: IRetryPredicate = (error: Error) => {
  if ({}.hasOwnProperty.call(error, 'name')) {
    return error.name === 'TimeoutError'
  }
  return false
}

/**
 *
 * @description mssql specific predicate that will only signal for a retry if a timeout occured
 * @param {Error} error the error thrown that needs inspecting to determine whether a retry should be invoked
 */
export const sqlAzureRequestTimeoutRetryPredicate: IRetryPredicate = (error: any) => {
  if ({}.hasOwnProperty.call(error, 'code')) {
    return error.code === 'ETIMEOUT'
  }
  return false
}

/**
 * @description - Azure MSSQL temporary resource limit reached
 * @param error
 * @returns
 */
export const sqlAzureResourceLimitReachedPredicate: IRetryPredicate = (error: any) => {
  if (error && {}.hasOwnProperty.call(error, 'number')) {
    // https://docs.microsoft.com/en-gb/azure/sql-database/troubleshoot-connectivity-issues-microsoft-azure-sql-database#resource-governance-errors
    return error.number === 10928
  }
  return false
}

/**
 * @description Temporary socket failure seen in 2022. Potentially caused by Azure or resource overload?  Ignore and retry...
 * @param error
 * @returns
 */
export const socketErrorPredicate: IRetryPredicate = (error: any) => {
  if (error && {}.hasOwnProperty.call(error, 'code')) {
    return error.code === 'ESOCKET'
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
  } catch (error: any) {
    if (retryStrategy.attempts > 1 && retryPredicate(error)) {
      await waitAsync(retryStrategy.pauseTimeMs)
      retryStrategy.attempts--
      retryStrategy.pauseTimeMs *= retryStrategy.pauseMultiplier
      result = await asyncRetryHandler(asyncMethod, retryStrategy, retryPredicate)
    } else {
      throw error
    }
  }
  return result
}

export default asyncRetryHandler
