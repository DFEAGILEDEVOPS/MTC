import { RedisService, IRedisDataService } from './redis-service'

const RedisDataServiceMock = jest.fn<IRedisDataService, any>(() => ({
  get: jest.fn(),
  pipeline: jest.fn(),
  setex: jest.fn()
}))

let sut: RedisService
let redisDataServiceMock: IRedisDataService

describe('RedisService', () => {

  beforeEach(() => {
    redisDataServiceMock = new RedisDataServiceMock()
    sut = new RedisService(redisDataServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
