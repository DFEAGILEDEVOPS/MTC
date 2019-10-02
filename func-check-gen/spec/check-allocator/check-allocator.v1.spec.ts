import * as subject from '../../check-allocator/check-allocator.v1'
import { IRedisService } from '../../lib/data-access/redis-service'
import { ICheckWindowService } from '../../lib/CheckWindowService'

let sut: subject.CheckAllocatorV1

const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn()
}))

const CheckWindowServiceMock = jest.fn<ICheckWindowService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn()
}))

describe('check-allocator/v1', () => {
  beforeEach(() => {
    sut = new subject.CheckAllocatorV1()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('allocation is only created for pupils that do not have an existing allocation', () => {
    fail('not implemented')
  })

  test('form allocation is performed by form allocation service', () => {
    fail('not implemented')
  })

  test('pin allocation is performed by pin allocation service', () => {
    fail('not implemented')
  })

  test('allocation expires at end of current check window', () => {
    fail('not implemented')
  })

  test('allocation is persisted in Redis', () => {
    fail('not implemented')
  })
})
