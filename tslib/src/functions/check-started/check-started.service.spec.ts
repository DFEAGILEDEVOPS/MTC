import { CheckStartedService, type ICheckStartedMessage } from './check-started.service.js'
import { RedisServiceMock } from '../../caching/redis-service.mock.js'
import { type IRedisService } from '../../caching/redis-service.js'
import { type ICheckStartedDataService } from './check-started.data.service.js'

let sut: CheckStartedService
let redisServiceMock: IRedisService
let dataServiceMock: ICheckStartedDataService

const CheckStartedDataServiceMock = jest.fn<ICheckStartedDataService, any>(() => ({
  updateCheckStartedDate: jest.fn(),
  isLiveCheck: jest.fn().mockResolvedValue(false)
}))

describe('check-started.service', () => {
  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    dataServiceMock = new CheckStartedDataServiceMock()
    sut = new CheckStartedService(redisServiceMock, dataServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it updates the mtc_admin.check record with check started datetime if live check', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      if (key.startsWith('prepared-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: false
          }
        }
      }
    })
    await sut.process(message)
    expect(dataServiceMock.updateCheckStartedDate).toHaveBeenCalledTimes(1)
  })

  test('it does not update the mtc_admin.check record with check started datetime if TIO check', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      if (key.startsWith('prepared-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: true
          }
        }
      }
    })
    await sut.process(message)
    expect(dataServiceMock.updateCheckStartedDate).not.toHaveBeenCalled()
  })

  test('it drops preparedCheck from redis if a live check', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      if (key.startsWith('prepared-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: false
          }
        }
      }
    })
    await sut.process(message)
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

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      if (key.startsWith('prepared-check-lookup')) {
        return preparedCheckKey
      } else {
        return {
          config: {
            practice: true
          }
        }
      }
    })
    await sut.process(message)
    expect(redisServiceMock.drop).not.toHaveBeenCalled()
  })

  test('it resolves prepared-check lookup key when stored using raw-case check code', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'aBcD1234',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      if (key === 'prepared-check-lookup:ABCD1234') {
        return null
      }
      if (key === 'prepared-check-lookup:aBcD1234') {
        return preparedCheckKey
      }
      if (key === preparedCheckKey) {
        return {
          config: {
            practice: false
          }
        }
      }
      return null
    })

    await sut.process(message)
    expect(dataServiceMock.updateCheckStartedDate).toHaveBeenCalledTimes(1)
  })

  test('it falls back to DB live-check lookup when prepared check payload is missing', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }
    const preparedCheckKey = 'prepared-check-key'

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async (key: string) => {
      if (key.startsWith('prepared-check-lookup')) {
        return preparedCheckKey
      }
      return null
    })
    jest.spyOn(dataServiceMock, 'isLiveCheck').mockResolvedValue(true)

    await sut.process(message)
    expect(dataServiceMock.isLiveCheck).toHaveBeenCalledTimes(1)
    expect(dataServiceMock.updateCheckStartedDate).toHaveBeenCalledTimes(1)
  })

  test('it does not attempt to drop from redis if no prepared check found', async () => {
    const message: ICheckStartedMessage = {
      checkCode: 'check-code',
      clientCheckStartedAt: new Date(),
      version: 1
    }

    jest.spyOn(redisServiceMock, 'get').mockImplementation(async () => {
      return null
    })
    await sut.process(message)
    expect(redisServiceMock.drop).not.toHaveBeenCalled()
  })
})
