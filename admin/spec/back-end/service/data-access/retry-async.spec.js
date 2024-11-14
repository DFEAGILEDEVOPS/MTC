'use strict'
/* global describe, expect, fail beforeEach, test, jest, afterEach */

const {
  asyncRetryHandler,
  sqlAzureTimeoutRetryPredicate,
  sqlAzureResourceLimitReachedPredicate,
  socketErrorPredicate
} = require('../../../../services/data-access/retry-async')

const logger = require('../../../../services/log.service').getLogger()

let retryPolicy

describe('async-retry', () => {
  beforeEach(() => {
    retryPolicy = {
      attempts: 3,
      pauseTimeMs: 50,
      pauseMultiplier: 1.1
    }
    jest.spyOn(logger, 'error').mockImplementation()
    jest.spyOn(logger, 'info').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('default behaviour', () => {
    test('should execute and return as expected when no error is thrown', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        return Promise.resolve(callCount)
      }
      const actualCallCount = await asyncRetryHandler(func)
      expect(actualCallCount).toBe(1)
    })

    test('subsequent attempts should not be made by default', async () => {
      const errorMessage = 'the error message'
      const func = () => {
        return Promise.reject(new Error(errorMessage))
      }
      try {
        await asyncRetryHandler(func)
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe(errorMessage)
      }
    })

    test('total number of attempts should match retry strategy', async () => {
      const maxAttempts = 3
      const strategy = {
        attempts: maxAttempts,
        pauseMultiplier: 1.1,
        pauseTimeMs: 20
      }
      let callCount = 0
      const func = () => {
        callCount++
        return Promise.reject(callCount)
      }
      try {
        await asyncRetryHandler(func, strategy, () => true)
      } catch {
        expect(callCount).toBe(maxAttempts)
      }
    })

    test('should complete if retry attempts do not exceed maximum number of retries in strategy', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        if (callCount < 3) {
          return Promise.reject(new Error(`callCount is ${callCount}`))
        } else {
          return Promise.resolve(callCount)
        }
      }
      try {
        await asyncRetryHandler(func, retryPolicy, () => true)
        expect(callCount).toBe(3)
      } catch {
        fail(`should have completed after 3 attempts. attempts made:${callCount}`)
      }
    })

    test('should fail if retries made exceeds configured maximum number of retries', async () => {
      let callCount = 0
      const errorMessage = 'this is the error message'
      const func = () => {
        callCount++
        if (callCount < 4) {
          return Promise.reject(new Error(errorMessage))
        } else {
          return Promise.resolve(callCount)
        }
      }
      try {
        await asyncRetryHandler(func, retryPolicy, () => true)
        fail('should not have completed')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe(errorMessage)
      }
    })
  })

  describe('sql timeout retry predicate', () => {
    test('should not attempt retry if does not have a name property', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        return Promise.reject(new Error())
      }
      try {
        await asyncRetryHandler(func, retryPolicy, sqlAzureTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if name is not TimeoutError', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        const error = new Error()
        error.name = 'SomeError'
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, sqlAzureTimeoutRetryPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if name is TimeoutError', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        const error = new Error('this is a timeout error')
        error.name = 'TimeoutError'
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, sqlAzureTimeoutRetryPredicate)
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
      const func = () => {
        callCount++
        return Promise.reject(new Error())
      }
      try {
        await asyncRetryHandler(func, retryPolicy, sqlAzureResourceLimitReachedPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if error.number is not 10928', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        const error = new Error()
        error.number = 12345
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, sqlAzureResourceLimitReachedPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if error.number is 10928', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        const error = new Error()
        error.number = 10928
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, sqlAzureResourceLimitReachedPredicate)
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
      const func = () => {
        callCount++
        const error = new Error('mock error from unit testing')
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, socketErrorPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should not attempt retry if code is not ESOCKET', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        const error = new Error('mock error from unit testing')
        error.code = 'SOMECODE'
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, socketErrorPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(1)
      }
    })

    test('should attempt retry if code is ESOCKET', async () => {
      let callCount = 0
      const func = () => {
        callCount++
        const error = new Error('mock error from unit testing')
        error.code = 'ESOCKET'
        return Promise.reject(error)
      }
      try {
        await asyncRetryHandler(func, retryPolicy, socketErrorPredicate)
        fail('error should have thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(callCount).toBe(3)
      }
    })
  })
})
