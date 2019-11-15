import { CheckStartedService, ICheckStartedFunctionBindings, ICheckStartedMessage } from './check-started.service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { IRedisService } from '../../caching/redis-service'

let sut: CheckStartedService
let redisServiceMock: IRedisService
let functionBindings: ICheckStartedFunctionBindings

describe('check-started.service', () => {

  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    sut = new CheckStartedService(redisServiceMock)
    functionBindings = {
      checkStartedTable: []
    }
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it looks up preparedCheck redis key via check started link key to delete preparedCheck', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const cacheLookupKey = `check-started-check-lookup:${message.checkCode}`
    const preparedCheckKey = 'prepared-check-key'

    redisServiceMock.get = jest.fn(async (key: string) => {
      return preparedCheckKey
    })
    await sut.process(message, functionBindings)
    expect(redisServiceMock.get).toHaveBeenCalledWith(cacheLookupKey)
    expect(redisServiceMock.drop).toHaveBeenCalledWith([preparedCheckKey])
  })

  test('it appends the check-started entry to azure table storage output binding', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    redisServiceMock.get = jest.fn(async (key: string) => {
      return preparedCheckKey
    })
    await sut.process(message, functionBindings)
    expect(functionBindings.checkStartedTable.length).toBe(1)
  })
})
