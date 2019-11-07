import { RedisPupilAuthenticationService } from './redis-pupil-auth.service'
import { RedisServiceMock, IRedisService } from './redis.service'

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
    const pupilPin = '5678'
    const expectedKey = `preparedCheck:${schoolPin}:${pupilPin}`
    await sut.authenticate(schoolPin, pupilPin)
    expect(actualKey).toEqual(expectedKey)
  })

  test('an error should be thrown if either argument is an empty string', async () => {
    let schoolPin = 'abc12def'
    let pupilPin = ''
    try {
      await sut.authenticate(schoolPin, pupilPin)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error.message).toBe('schoolPin and pupilPin cannot be an empty string')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
    schoolPin = ''
    pupilPin = '1234'
    try {
      await sut.authenticate(schoolPin, pupilPin)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error.message).toBe('schoolPin and pupilPin cannot be an empty string')
    }
    expect(redisServiceMock.get).not.toHaveBeenCalled()
  })
})
