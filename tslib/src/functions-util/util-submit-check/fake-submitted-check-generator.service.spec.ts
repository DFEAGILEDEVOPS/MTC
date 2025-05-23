import { FakeCompletedCheckMessageGeneratorService } from './fake-submitted-check-generator.service'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'
import mockPreparedCheck from '../../common/mocks/mock-prepared-check-2021.json'
import { FakeCompletedCheckGeneratorService, type ICompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import { type ICompressionService } from '../../common/compression-service'
import { type IPreparedCheckService } from '../../caching/prepared-check.service'

let sut: FakeCompletedCheckMessageGeneratorService
let preparedCheckServiceMock: IPreparedCheckService
let submittedCheckBuilderMock: ICompletedCheckGeneratorService
let compressionServiceMock: ICompressionService

const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'

const SubmittedCheckBuilderServiceMock = jest.fn<ICompletedCheckGeneratorService, any>(() => ({
  create: jest.fn()
}))

const CompressionServiceMock = jest.fn<ICompressionService, any>(() => ({
  compressToUTF16: jest.fn(),
  decompressFromUTF16: jest.fn(),
  compressToBase64: jest.fn(),
  decompressFromBase64: jest.fn(),
  compressToGzip: jest.fn(),
  decompressFromGzip: jest.fn()
}))

const PreparedCheckServiceMock = jest.fn<IPreparedCheckService, any>(() => ({
  fetch: jest.fn()
}))

describe('fake-submitted-check-message-builder-service', () => {
  beforeEach(() => {
    preparedCheckServiceMock = new PreparedCheckServiceMock()
    submittedCheckBuilderMock = new SubmittedCheckBuilderServiceMock()
    compressionServiceMock = new CompressionServiceMock()
    sut = new FakeCompletedCheckMessageGeneratorService(submittedCheckBuilderMock, compressionServiceMock, preparedCheckServiceMock)
    const fakeSubmittedCheckBuilder = new FakeCompletedCheckGeneratorService()
    const fakeSubmittedCheck = fakeSubmittedCheckBuilder.create(mockPreparedCheck)
    jest.spyOn(submittedCheckBuilderMock, 'create').mockReturnValue(fakeSubmittedCheck)
    jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve(mockPreparedCheck))
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(FakeCompletedCheckMessageGeneratorService)
  })

  describe('create v2 message', () => {
    test('populates expected properties', async () => {
      const compressedObject = 'compressed-as-string'
      jest.spyOn(compressionServiceMock, 'compressToUTF16').mockReturnValue(compressedObject)
      const actual = await sut.createV2Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.checkCode).toStrictEqual(checkCode)
      expect(actual.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
      expect(actual.version).toBe(2)
      expect(actual.archive).toStrictEqual(compressedObject)
      expect(compressionServiceMock.compressToUTF16).toHaveBeenCalledTimes(1)
    })

    test('fetches prepared check with expected check code', async () => {
      await sut.createV2Message(checkCode)
      expect(preparedCheckServiceMock.fetch).toHaveBeenCalledWith(checkCode)
    })

    test('if prepared check not found an error should be thrown', async () => {
      jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve())
      try {
        await sut.createV2Message(checkCode)
        fail('error should have been thrown due to prepared check not being found in redis')
      } catch (error: any) {
        expect(error.message).toBe(`prepared check not found in redis with checkCode:${checkCode}`)
      }
    })

    test('produces a v2 submitted check when version not specified', async () => {
      const compressedObject = 'compressed-as-string'
      jest.spyOn(compressionServiceMock, 'compressToUTF16').mockReturnValue(compressedObject)
      const actual = await sut.createV2Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.version).toStrictEqual(SubmittedCheckVersion.V2)
    })
  })

  describe('v3 message', () => {
    test('produces a v3 message', async () => {
      jest.spyOn(compressionServiceMock, 'compressToUTF16')
      const compressedString = 'compressed-string'
      jest.spyOn(compressionServiceMock, 'compressToBase64').mockReturnValue(compressedString)
      const version3Spec = SubmittedCheckVersion.V3
      const actual = await sut.createV3Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.version).toStrictEqual(version3Spec)
      expect(actual.archive).toStrictEqual(compressedString)
      expect(compressionServiceMock.compressToUTF16).not.toHaveBeenCalled()
      expect(compressionServiceMock.compressToBase64).toHaveBeenCalledTimes(1)
    })

    test('fetches prepared check with expected check code', async () => {
      await sut.createV3Message(checkCode)
      expect(preparedCheckServiceMock.fetch).toHaveBeenCalledWith(checkCode)
    })

    test('if prepared check not found an error should be thrown', async () => {
      jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve())
      try {
        await sut.createV3Message(checkCode)
        fail('error should have been thrown due to prepared check not being found in redis')
      } catch (error: any) {
        expect(error.message).toBe(`prepared check not found in redis with checkCode:${checkCode}`)
      }
    })
  })

  describe('v4 message', () => {
    test('produces a v4 message', async () => {
      const compressedString = 'compressed-string'
      jest.spyOn(compressionServiceMock, 'compressToGzip').mockReturnValue(compressedString)
      const version4Spec = SubmittedCheckVersion.V4
      const actual = await sut.createV4Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.version).toStrictEqual(version4Spec)
      expect(actual.archive).toStrictEqual(compressedString)
      expect(compressionServiceMock.compressToGzip).toHaveBeenCalledTimes(1)
    })

    test('fetches prepared check with expected check code', async () => {
      await sut.createV4Message(checkCode)
      expect(preparedCheckServiceMock.fetch).toHaveBeenCalledWith(checkCode)
    })

    test('if prepared check not found an error should be thrown', async () => {
      jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve())
      try {
        await sut.createV3Message(checkCode)
        fail('error should have been thrown due to prepared check not being found in redis')
      } catch (error: any) {
        expect(error.message).toBe(`prepared check not found in redis with checkCode:${checkCode}`)
      }
    })
  })
})
