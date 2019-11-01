import { CheckWindowService } from './check-window.service'
import { ICheckWindowDataService } from './data/check-window.data.service'
import { IRedisService } from '../caching/redis-service'
import { RedisServiceMock } from '../caching/redis-service.mock'

const CheckWindowDataServiceMock = jest.fn<ICheckWindowDataService, any>(() => ({
  getActiveCheckWindow: jest.fn()
}))

const redisCheckWindowKey = 'activeCheckWindow'

let sut: CheckWindowService
let redisServiceMock: IRedisService
let checkWindowDataServiceMock: ICheckWindowDataService

describe('check-window.service', () => {
  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    checkWindowDataServiceMock = new CheckWindowDataServiceMock()
    sut = new CheckWindowService(redisServiceMock, checkWindowDataServiceMock)
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('check window is retrieved from database when not found in cache', async () => {
    checkWindowDataServiceMock.getActiveCheckWindow = jest.fn(() => {
      return Promise.resolve({
        id: 1
      })
    })
    const window = await sut.getActiveCheckWindow()
    expect(window).toBeDefined()
    expect(redisServiceMock.get).toHaveBeenCalledWith('activeCheckWindow')
    expect(checkWindowDataServiceMock.getActiveCheckWindow).toHaveBeenCalled()
  })

  test('check window is added to cache after retrieving from database', async () => {
    checkWindowDataServiceMock.getActiveCheckWindow = jest.fn(() => {
      return Promise.resolve({
        id: 1
      })
    })
    const twentyFourHoursInSeconds = 86400
    const window = await sut.getActiveCheckWindow()
    expect(window).toBeDefined()
    expect(redisServiceMock.get).toHaveBeenCalledWith('activeCheckWindow')
    expect(redisServiceMock.setex)
      .toHaveBeenCalledWith(redisCheckWindowKey, { id: 1 }, twentyFourHoursInSeconds)
    expect(checkWindowDataServiceMock.getActiveCheckWindow).toHaveBeenCalled()
  })

  test('check window is returned straight from cache when present', async () => {
    redisServiceMock.get = jest.fn((key: string) => {
      return Promise.resolve({
        id: 1
      })
    })
    const window = await sut.getActiveCheckWindow()
    expect(window).toBeDefined()
    expect(redisServiceMock.get).toHaveBeenCalledWith('activeCheckWindow')
    expect(redisServiceMock.setex).not.toHaveBeenCalled()
    expect(checkWindowDataServiceMock.getActiveCheckWindow).not.toHaveBeenCalled()
  })
})
