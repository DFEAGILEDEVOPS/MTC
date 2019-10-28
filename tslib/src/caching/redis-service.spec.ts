import { RedisService } from './redis-service'

let sut: RedisService

describe('RedisService', () => {

  beforeEach(() => {
    sut = new RedisService()
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
