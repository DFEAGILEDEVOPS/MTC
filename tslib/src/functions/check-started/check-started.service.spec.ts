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

  test('it appends the check-started entry to azure table storage output binding', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    redisServiceMock.get = jest.fn(async (key: string) => {
      if (key.startsWith('check-started-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: false
          }
        }
      }
    })
    await sut.process(message, functionBindings)
    expect(functionBindings.checkStartedTable.length).toBe(1)
  })

  test('it drops preparedCheck from redis if a live check', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    redisServiceMock.get = jest.fn(async (key: string) => {
      if (key.startsWith('check-started-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: false
          }
        }
      }
    })
    await sut.process(message, functionBindings)
    expect(redisServiceMock.drop).toHaveBeenCalledTimes(1)
    expect(redisServiceMock.drop).toHaveBeenCalledWith([preparedCheckKey])
  })

  test('it does not drop preparedCheck from redis if a practice check', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    redisServiceMock.get = jest.fn(async (key: string) => {

      if (key.startsWith('check-started-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: true
          }
        }
      }
    })
    await sut.process(message, functionBindings)
    expect(redisServiceMock.drop).not.toHaveBeenCalled()
  })
})
