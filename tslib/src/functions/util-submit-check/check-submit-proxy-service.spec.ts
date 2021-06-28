import { CheckSubmitProxyOptions, CheckSubmitProxyService } from './check-submit-proxy-service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { IRedisService } from '../../caching/redis-service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'
import { ISubmittedCheckBuilderService } from './submitted-check-builder-service'

let sut: CheckSubmitProxyService
let redisServiceMock: IRedisService
let submittedCheckBuilderMock: ISubmittedCheckBuilderService

const options: CheckSubmitProxyOptions = {
  isLiveCheck: true,
  correctAnswerCount: 22,
  removeAnswers: false
}

const SubmittedCheckBuilderServiceMock = jest.fn<ISubmittedCheckBuilderService, any>(() => ({
  create: jest.fn()
}))

describe('check-submit-proxy-service', () => {
  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    submittedCheckBuilderMock = new SubmittedCheckBuilderServiceMock()
    sut = new CheckSubmitProxyService(redisServiceMock, submittedCheckBuilderMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(CheckSubmitProxyService)
  })

  test('calls redis with expected cache key', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    const expectedCacheKey = `prepared-check-lookup:${checkCode}`
    jest.spyOn(redisServiceMock, 'get').mockReturnValue(Promise.resolve(mockPreparedCheck))
    await sut.submitCheck(checkCode, options)
    expect(redisServiceMock.get).toHaveBeenCalledWith(expectedCacheKey)
  })

  test('populates version, checkCode and schoolUUID at top level', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    jest.spyOn(redisServiceMock, 'get').mockReturnValue(Promise.resolve(mockPreparedCheck))
    const actual = await sut.submitCheck(checkCode, options)
    expect(actual).toBeDefined()
    expect(actual.checkCode).toStrictEqual(checkCode)
    expect(actual.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
    expect(actual.version).toBe(2)
  })

  test('compresses payload of submitted check for archive property', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    jest.spyOn(redisServiceMock, 'get').mockReturnValue(Promise.resolve(mockPreparedCheck))
    const actual = await sut.submitCheck(checkCode, options)
    expect(actual).toBeDefined()
    expect(actual.archive).toBeDefined()
    expect(actual.version).toBe(2)
  })

  test.todo('calls completed check builder service')
  test.todo('verify compression into archive property')
})
