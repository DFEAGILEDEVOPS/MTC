import retry, { IRetryPolicy } from './async-retry'

const retryPolicy: IRetryPolicy = {
  attempts: 3,
  pauseTimeMs: 500,
  pauseMultiplier: 1.5
}

describe('async-retry', () => {

  test('function should execute and return as expected when no error is thrown', async () => {
    let callCount = 0
    const func = (): Promise<number> => {
      callCount++
      return Promise.resolve(callCount)
    }
    const actualCallCount = await retry<number>(func)
    expect(actualCallCount).toBe(1)
  })

  test('function should complete if retries made does not exceed configured maximum number of retries', async () => {
    let callCount = 0
    const func = (): Promise<number> => {
      callCount++
      if (callCount < 3) {
        return Promise.reject(new Error(`callCount is ${callCount}`))
      } else {
        return Promise.resolve(callCount)
      }
    }
    const actualCallCount = await retry<number>(func, retryPolicy)
    expect(actualCallCount).toBe(3)
  })

  test.only('function should fail if retries made exceeds configured maximum number of retries', async () => {
    let callCount = 0
    const func = (): Promise<number> => {
      callCount++
      if (callCount < 4) {
        return Promise.reject(new Error(`callCount is ${callCount}`))
      } else {
        return Promise.resolve(callCount)
      }
    }
    try {
      await retry<number>(func, retryPolicy)
      fail('should not have completed')
    } catch (error) {
      expect(error.message).toBe('callCount is 3')
    }

  })
})
