import retry, { type IRetryStrategy, socketErrorPredicate, sqlAzureRequestTimeoutRetryPredicate, sqlAzureResourceLimitReachedPredicate, sqlAzureTimeoutRetryPredicate } from './async-retry'
import { ConnectionError, RequestError, PreparedStatementError, TransactionError } from 'mssql'

let retryPolicy: IRetryStrategy

describe('async-retry', () => {
  beforeEach(() => {
    retryPolicy = {
      attempts: 3,
      pauseTimeMs: 50,
      pauseMultiplier: 1.1
    }
  })

  describe('default behaviour', () => {
    test('function should execute and return as expected when no error is thrown', async () => {
      let callCount = 0
      const func = async (): Promise<number> => {
        callCount++
        return Promise.resolve(callCount)
      }
      const actualCallCount = await retry<number>(func)
      expect(actualCallCount).toBe(1)
    })

    test('subsequent attempts should not be made by default', async () => {
      const errorMessage = 'the error message'
      const func = async (): Promise<number> => {
        return Promise.reject(new Error(errorMessage))
      }
      try {
        await retry<number>(func)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        let errorMessage = 'unknown error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        expect(errorMessage).toBe(errorMessage)
      }
    })

    test('total number of attempts should match retry strategy', async () => {
      const maxAttempts = 3
      const strategy: IRetryStrategy = {
        attempts: maxAttempts,
        pauseMultiplier: 1.1,
        pauseTimeMs: 20
      }
      let callCount = 0
      const func = async (): Promise<number> => {
        callCount++
        return Promise.reject(callCount)
      }
      try {
        await retry<number>(func, strategy, () => true)
      } catch {
        expect(callCount).toBe(maxAttempts)
      }
    })

    test('should complete if retry attempts do not exceed maximum number of retries in strategy', async () => {
      let callCount = 0
      const func = async (): Promise<number> => {
        callCount++
        if (callCount < 3) {
          return Promise.reject(new Error(`callCount is ${callCount}`))
        } else {
          return Promise.resolve(callCount)
        }
      }
      try {
        await retry<number>(func, retryPolicy, () => true)
        expect(callCount).toBe(3)
      } catch {
        fail(`should have completed after 3 attempts. attempts made:${callCount}`)
      }
    })

    test('should fail if retries made exceeds configured maximum number of retries', async () => {
      let callCount = 0
      const errorMessage = 'this is the error message'
      const func = async (): Promise<number> => {
        callCount++
        if (callCount < 4) {
          return Promise.reject(new Error(errorMessage))
        } else {
          return Promise.resolve(callCount)
        }
      }
      try {
        await retry<number>(func, retryPolicy, () => true)
        fail('should not have completed')
      } catch (error) {
        expect(error).toBeDefined()
        let errorMessage = 'unknown error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        expect(errorMessage).toBe(errorMessage)
      }
    })
  })

  describe('sql specific behaviour', () => {
    test('should not attempt retry if not one of mssql error types', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new Error())
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql connection error not a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new ConnectionError('error', 'not a timeout'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql request error not a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new RequestError('error', 'not a timeout'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql prepared statement error not a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new PreparedStatementError('error', 'not a timeout'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql transaction error not a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new TransactionError('error', 'not a timeout'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if mssql connection error a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new ConnectionError('error', 'ETIMEOUT'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })

    test('should attempt retry if mssql request error a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new RequestError('error', 'ETIMEOUT'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })

    test('should attempt retry if mssql prepared statement error a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new PreparedStatementError('error', 'ETIMEOUT'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })

    test('should attempt retry if mssql transaction error a timeout', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new TransactionError('error', 'ETIMEOUT'))
      }
      try {
        await retry<unknown>(func, retryPolicy, sqlAzureRequestTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })
  })

  describe('sql timeout retry predicate', () => {
    test('should not attempt retry if does not have a name property', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new Error())
      }
      try {
        await retry(func, retryPolicy, sqlAzureTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if name is not TimeoutError', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error = new Error()
        error.name = 'SomeError'
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, sqlAzureTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if name is TimeoutError', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error = new Error('this is a timeout error')
        error.name = 'TimeoutError'
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, sqlAzureTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })
  })

  describe('sql azure resource limit reached predicate', () => {
    test('should not attempt retry if error does not have a number property', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        return Promise.reject(new Error())
      }
      try {
        await retry(func, retryPolicy, sqlAzureResourceLimitReachedPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if error.number is not 10928', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error: any = new Error()
        error.number = 12345
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, sqlAzureResourceLimitReachedPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if error.number is 10928', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error: any = new Error()
        error.number = 10928
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, sqlAzureResourceLimitReachedPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })
  })

  describe('socket error predicate', () => {
    test('should not attempt retry if the error does not have a status property', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error = new Error('mock error from unit testing')
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, socketErrorPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if code is not ESOCKET', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error: any = new Error('mock error from unit testing')
        error.code = 'SOMECODE'
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, socketErrorPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if code is ESOCKET', async () => {
      let callCount = 0
      const func = async (): Promise<void> => {
        callCount++
        const error: any = new Error('mock error from unit testing')
        error.code = 'ESOCKET'
        return Promise.reject(error)
      }
      try {
        await retry(func, retryPolicy, socketErrorPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })
  })
})
