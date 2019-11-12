import { CheckStartedService } from './check-started.service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { IRedisService } from '../../caching/redis-service'

let sut: CheckStartedService
let redisServiceMock: IRedisService

describe('check-started.service', () => {

  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    sut = new CheckStartedService(redisServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it looks up preparedCheck redis key via check started link key to delete preparedCheck', async () => {
    const checkCode = 'check-code'
    const preparedCheckKey = 'prepared-check-key'

    redisServiceMock.get = jest.fn(async (key: string) => {
      return preparedCheckKey
    })
    await sut.process(checkCode)
    expect(redisServiceMock.get).toHaveBeenCalledWith(checkCode)
    expect(redisServiceMock.drop).toHaveBeenCalledWith([preparedCheckKey])
  })
})
