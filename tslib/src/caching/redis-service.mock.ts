import { type IRedisService } from './redis-service'

export const RedisServiceMock = jest.fn<IRedisService, any>(() => ({
  get: jest.fn(),
  setex: jest.fn(),
  drop: jest.fn(),
  quit: jest.fn(),
  set: jest.fn(),
  ttl: jest.fn(),
  expire: jest.fn(),
  dropByPrefix: jest.fn()
}))
