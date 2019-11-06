import { RedisPupilAuthenticationService } from '../../services/redis-pupil-authentication.service'
import { RedisServiceMock, IRedisService } from '../../services/redis.service'

let sut: RedisPupilAuthenticationService
let redisServiceMock: IRedisService

describe('redis-pupil-auth.service', () => {

  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    sut = new RedisPupilAuthenticationService(redisServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should call redis:get with correct key format', async () => {
    let actualKey: string
    redisServiceMock.get = jest.fn((key: string) => {
      actualKey = key
      return Promise.resolve()
    })
    const schoolPin = 'abc12def'
    const pupilPin = 5678
    const expectedKey = `preparedCheck:${schoolPin}:${pupilPin}`
    await sut.authenticate(schoolPin, pupilPin)
    expect(actualKey).toEqual(expectedKey)
  })
})
