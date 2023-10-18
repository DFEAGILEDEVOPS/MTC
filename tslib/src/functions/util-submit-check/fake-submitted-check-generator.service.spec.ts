import { FakeSubmittedCheckMessageGeneratorService, SubmittedCheckVersion } from './fake-submitted-check-generator.service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'
import { FakeCompletedCheckGeneratorService, type ICompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import { type ICompressionService } from '../../common/compression-service'
import { type IPreparedCheckService } from '../../caching/prepared-check.service'

let sut: FakeSubmittedCheckMessageGeneratorService
let preparedCheckServiceMock: IPreparedCheckService
let submittedCheckBuilderMock: ICompletedCheckGeneratorService
let compressionServiceMock: ICompressionService

const checkCode = 'b8ad45ac-b2c9-48ff-8c9f-afebb2956bab'

const SubmittedCheckBuilderServiceMock = jest.fn<ICompletedCheckGeneratorService, any>(() => ({
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
    sut = new FakeSubmittedCheckMessageGeneratorService(submittedCheckBuilderMock, compressionServiceMock, preparedCheckServiceMock)
    const fakeSubmittedCheckBuilder = new FakeCompletedCheckGeneratorService()
    const fakeSubmittedCheck = fakeSubmittedCheckBuilder.create(mockPreparedCheck)
    jest.spyOn(submittedCheckBuilderMock, 'create').mockReturnValue(fakeSubmittedCheck)
    jest.spyOn(preparedCheckServiceMock, 'fetch').mockReturnValue(Promise.resolve(mockPreparedCheck))
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(FakeSubmittedCheckMessageGeneratorService)
  })

  describe('create v2 message', () => {
    test('populates expected properties', async () => {
      const compressedObject = 'compressed-as-string'
      jest.spyOn(compressionServiceMock, 'compress').mockReturnValue(compressedObject)
      const actual = await sut.createV2Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.checkCode).toStrictEqual(checkCode)
      expect(actual.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
      expect(actual.version).toBe(2)
      expect(actual.archive).toStrictEqual(compressedObject)
      expect(compressionServiceMock.compress).toHaveBeenCalledTimes(1)
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
      jest.spyOn(compressionServiceMock, 'compress').mockReturnValue(compressedObject)
      const actual = await sut.createV2Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.version).toStrictEqual(SubmittedCheckVersion.V2)
    })
  })

  describe('v3 message', () => {
    test('produces a v3 message when requested', async () => {
      jest.spyOn(compressionServiceMock, 'compress')
      const version3Spec = SubmittedCheckVersion.V3
      const actual = await sut.createV3Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.version).toStrictEqual(version3Spec)
      expect(compressionServiceMock.compress).not.toHaveBeenCalled()
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

    test('populates message with expected properties', async () => {
      const actual = await sut.createV3Message(checkCode)
      expect(actual).toBeDefined()
      expect(actual.checkCode).toStrictEqual(checkCode)
      expect(actual.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
      expect(actual.version).toBe(SubmittedCheckVersion.V3)
      expect(actual.buildVersion).toBeDefined()
      expect(actual.config).toBeDefined()
      expect(actual.device).toBeDefined()
      expect(actual.pupil).toBeDefined()
      expect(actual.questions).toBeDefined()
      expect(actual.school).toBeDefined()
      expect(actual.tokens).toBeDefined()
      expect(actual.audit).toBeDefined()
      expect(actual.inputs).toBeDefined()
      expect(actual.answers).toBeDefined()
    })
  })
})
