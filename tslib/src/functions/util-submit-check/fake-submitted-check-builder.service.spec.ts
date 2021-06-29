import { CheckSubmitProxyOptions, SubmittedCheckMessageBuilderService } from './fake-submitted-check-builder.service'
import { RedisServiceMock } from '../../caching/redis-service.mock'
import { IRedisService } from '../../caching/redis-service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'
import { FakeCompletedCheckBuilderService, ISubmittedCheckBuilderService } from './fake-completed-check-builder.service'
import { ICompressionService } from '../../common/compression-service'

let sut: SubmittedCheckMessageBuilderService
let redisServiceMock: IRedisService
let submittedCheckBuilderMock: ISubmittedCheckBuilderService
let compressionServiceMock: ICompressionService

const options: CheckSubmitProxyOptions = {
  isLiveCheck: true,
  correctAnswerCount: 22,
  answerCount: mockPreparedCheck.questions.length
}

const SubmittedCheckBuilderServiceMock = jest.fn<ISubmittedCheckBuilderService, any>(() => ({
  create: jest.fn()
}))

const CompressionServiceMock = jest.fn<ICompressionService, any>(() => ({
  compress: jest.fn(),
  decompress: jest.fn()
}))

describe('check-submit-proxy-service', () => {
  beforeEach(() => {
    redisServiceMock = new RedisServiceMock()
    submittedCheckBuilderMock = new SubmittedCheckBuilderServiceMock()
    compressionServiceMock = new CompressionServiceMock()
    sut = new SubmittedCheckMessageBuilderService(redisServiceMock, submittedCheckBuilderMock, compressionServiceMock)
    const fakeSubmittedCheckBuilder = new FakeCompletedCheckBuilderService()
    const fakeSubmittedCheck = fakeSubmittedCheckBuilder.create(mockPreparedCheck)
    jest.spyOn(submittedCheckBuilderMock, 'create').mockReturnValue(fakeSubmittedCheck)
    jest.spyOn(redisServiceMock, 'get').mockReturnValue(Promise.resolve(mockPreparedCheck))
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(SubmittedCheckMessageBuilderService)
  })

  test('calls redis with expected cache key', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    const expectedCacheKey = `prepared-check-lookup:${checkCode}`
    await sut.createSubmittedCheckMessage(checkCode, options)
    expect(redisServiceMock.get).toHaveBeenCalledWith(expectedCacheKey)
  })

  test('populates version, checkCode and schoolUUID at top level', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    const actual = await sut.createSubmittedCheckMessage(checkCode, options)
    expect(actual).toBeDefined()
    expect(actual.checkCode).toStrictEqual(checkCode)
    expect(actual.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
    expect(actual.version).toBe(2)
  })

  test('obtains submitted check payload from builder', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    const fakeSubmittedCheckBuilder = new FakeCompletedCheckBuilderService()
    const mockSubmittedCheck = fakeSubmittedCheckBuilder.create(mockPreparedCheck)
    jest.spyOn(submittedCheckBuilderMock, 'create').mockReturnValue(mockSubmittedCheck)
    const actual = await sut.createSubmittedCheckMessage(checkCode, options)
    expect(actual).toBeDefined()
    expect(submittedCheckBuilderMock.create).toHaveBeenCalledTimes(1)
  })

  test('uses compression service to create archive property', async () => {
    const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'
    const compressedObject = 'compressed-as-string'
    jest.spyOn(compressionServiceMock, 'compress').mockReturnValue(compressedObject)
    const actual = await sut.createSubmittedCheckMessage(checkCode, options)
    expect(actual).toBeDefined()
    expect(actual.archive).toStrictEqual(compressedObject)
    expect(compressionServiceMock.compress).toHaveBeenCalledTimes(1)
  })

  test.todo('if prepared check not found - what to do?')
})
