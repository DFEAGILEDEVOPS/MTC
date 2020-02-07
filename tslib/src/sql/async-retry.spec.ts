import retry, { IRetryStrategy, sqlTimeoutRetryPredicate } from './async-retry'
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
      const func = (): Promise<number> => {
        callCount++
        return Promise.resolve(callCount)
      }
      const actualCallCount = await retry<number>(func)
      expect(actualCallCount).toBe(1)
    })

    test('subsequent attempts should not be made by default', async () => {
      const errorMessage = 'the error message'
      const func = (): Promise<number> => {
        return Promise.reject(new Error(errorMessage))
      }
      try {
        await retry<number>(func)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe(errorMessage)
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
      const func = (): Promise<number> => {
        callCount++
        return Promise.reject(callCount)
      }
      try {
        await retry<number>(func, strategy, () => true)
      } catch (error) {
        expect(callCount).toBe(maxAttempts)
      }
    })

    test('should complete if retry attempts do not exceed maximum number of retries in strategy', async () => {
      let callCount = 0
      const func = (): Promise<number> => {
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
      } catch (error) {
        fail(`should have completed after 3 attempts. attempts made:${callCount}`)
      }
    })

    test('should fail if retries made exceeds configured maximum number of retries', async () => {
      let callCount = 0
      const errorMessage = 'this is the error message'
      const func = (): Promise<number> => {
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
        expect(error.message).toBe(errorMessage)
      }
    })
  })

  describe('sql specific behaviour', () => {

    test('should not attempt retry if not one of mssql error types', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new Error())
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql connection error not a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new ConnectionError('error', 'not a timeout'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql request error not a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new RequestError('error', 'not a timeout'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql prepared statement error not a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new PreparedStatementError('error', 'not a timeout'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if mssql transaction error not a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new TransactionError('error', 'not a timeout'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if mssql connection error a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new ConnectionError('error', 'ETIMEOUT'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })

    test('should attempt retry if mssql request error a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new RequestError('error', 'ETIMEOUT'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })

    test('should attempt retry if mssql prepared statement error a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new PreparedStatementError('error', 'ETIMEOUT'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })

    test('should attempt retry if mssql transaction error a timeout', async () => {
      let callCount = 0
      const func = (): Promise<void> => {
        callCount++
        return Promise.reject(new TransactionError('error', 'ETIMEOUT'))
      }
      try {
        await retry<void>(func, retryPolicy, sqlTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })
  })

})
