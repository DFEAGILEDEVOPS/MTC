import { CheckSubmitProxyOptions, FakeSubmittedCheckMessageBuilderService } from './fake-submitted-check-builder.service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'
import { FakeCompletedCheckBuilderService, ISubmittedCheckBuilderService } from './fake-completed-check-builder.service'
import { ICompressionService } from '../../common/compression-service'
import { IPreparedCheckService } from '../../caching/prepared-check.service'

let sut: FakeSubmittedCheckMessageBuilderService
let preparedCheckServiceMock: IPreparedCheckService
let submittedCheckBuilderMock: ISubmittedCheckBuilderService
let compressionServiceMock: ICompressionService

const options: CheckSubmitProxyOptions = {
  correctAnswerCount: 22
}

const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'

const SubmittedCheckBuilderServiceMock = jest.fn<ISubmittedCheckBuilderService, any>(() => ({
  create: jest.fn()
}))

const CompressionServiceMock = jest.fn<ICompressionService, any>(() => ({
  compress: jest.fn(),
  decompress: jest.fn()
}))

const PreparedCheckServiceMock = jest.fn<IPreparedCheckService, any>(() => ({
  fetch: jest.fn()
}))

describe('fake-submitted-check-message-builder-service', () => {
  beforeEach(() => {
    preparedCheckServiceMock = new PreparedCheckServiceMock()
    submittedCheckBuilderMock = new SubmittedCheckBuilderServiceMock()
    compressionServiceMock = new CompressionServiceMock()
    sut = new FakeSubmittedCheckMessageBuilderService(submittedCheckBuilderMock, compressionServiceMock, preparedCheckServiceMock)
    const fakeSubmittedCheckBuilder = new FakeCompletedCheckBuilderService()
    const fakeSubmittedCheck = fakeSubmittedCheckBuilder.create(mockPreparedCheck)
    jest.spyOn(submittedCheckBuilderMock, 'create').mockReturnValue(fakeSubmittedCheck)
    jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve(mockPreparedCheck))
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(FakeSubmittedCheckMessageBuilderService)
  })

  test('calls prepared check service with expected check code', async () => {
    await sut.createSubmittedCheckMessage(checkCode, options)
    expect(preparedCheckServiceMock.fetch).toHaveBeenCalledWith(checkCode)
  })

  test('populates version, checkCode and schoolUUID at top level', async () => {
    const actual = await sut.createSubmittedCheckMessage(checkCode, options)
    expect(actual).toBeDefined()
    expect(actual.checkCode).toStrictEqual(checkCode)
    expect(actual.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
    expect(actual.version).toBe(2)
  })

  test('obtains submitted check payload from builder', async () => {
    const fakeSubmittedCheckBuilder = new FakeCompletedCheckBuilderService()
    const mockSubmittedCheck = fakeSubmittedCheckBuilder.create(mockPreparedCheck)
    jest.spyOn(submittedCheckBuilderMock, 'create').mockReturnValue(mockSubmittedCheck)
    const actual = await sut.createSubmittedCheckMessage(checkCode, options)
    expect(actual).toBeDefined()
    expect(submittedCheckBuilderMock.create).toHaveBeenCalledTimes(1)
  })

  test('uses compression service to create archive property', async () => {
    const compressedObject = 'compressed-as-string'
    jest.spyOn(compressionServiceMock, 'compress').mockReturnValue(compressedObject)
    const actual = await sut.createSubmittedCheckMessage(checkCode, options)
    expect(actual).toBeDefined()
    expect(actual.archive).toStrictEqual(compressedObject)
    expect(compressionServiceMock.compress).toHaveBeenCalledTimes(1)
  })

  test('if prepared check not found an error should be thrown', async () => {
    jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve())
    try {
      await sut.createSubmittedCheckMessage(checkCode, options)
      fail('error should have been thrown due to prepared check not being found in redis')
    } catch (error) {
      expect(error.message).toStrictEqual(`prepared check not found in redis with checkCode:${checkCode}`)
    }
  })
})
