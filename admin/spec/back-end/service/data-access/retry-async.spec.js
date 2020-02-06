'use strict'
/* global describe, it, expect, fail */

const retry = require('../../../../services/data-access/retry-async')

const retryPolicy = {
  attempts: 3,
  pauseTimeMs: 500,
  pauseMultiplier: 1.5
}

describe('async-retry', () => {
  it('function should execute and return as expected when no error is thrown', async () => {
    let callCount = 0
    const func = () => {
      callCount++
      return Promise.resolve(callCount)
    }
    const actualCallCount = await retry(func)
    expect(actualCallCount).toBe(1)
  })

  it('function should complete if retries made does not exceed configured maximum number of retries', async () => {
    let callCount = 0
    const func = () => {
      callCount++
      if (callCount < 3) {
        const error = new Error(`callCount is ${callCount}`)
        error.code = 'ETIMEOUT'
        return Promise.reject(error)
      } else {
        return Promise.resolve(callCount)
      }
    }
    const actualCallCount = await retry(func, retryPolicy)
    expect(actualCallCount).toBe(3)
  })

  it('function should never retry if code property does not exist on error object', async () => {
    let callCount = 0
    const func = () => {
      callCount++
      if (callCount === 1) {
        const error = new Error(`callCount is ${callCount}`)
        return Promise.reject(error)
      } else {
        return Promise.resolve(callCount)
      }
    }
    const actualCallCount = await retry(func, retryPolicy)
    expect(actualCallCount).toBe(1)
  })

  it('function should never retry if code property does not equal timeout', async () => {
    let callCount = 0
    const func = () => {
      callCount++
      if (callCount === 1) {
        const error = new Error(`callCount is ${callCount}`)
        error.code = 'not a timeout'
        return Promise.reject(error)
      } else {
        return Promise.resolve(callCount)
      }
    }
    const actualCallCount = await retry(func, retryPolicy)
    expect(actualCallCount).toBe(1)
  })

  it('function should fail if retries made exceeds configured maximum number of retries', async () => {
    let callCount = 0
    const func = () => {
      callCount++
      if (callCount < 4) {
        const error = new Error(`callCount is ${callCount}`)
        error.code = 'ETIMEOUT'
        return Promise.reject(error)
      } else {
        return Promise.resolve(callCount)
      }
    }
    try {
      await retry(func, retryPolicy)
      fail('should not have completed')
    } catch (error) {
      expect(error.message).toBe('callCount is 3')
    }
  })
})
