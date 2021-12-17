import { ICompressionService } from '../../common/compression-service'
import { IReceivedCheckPayloadDataService } from './received-check-payload.data.service'
import { ReceivedCheckPayloadService } from './received-check-payload.service'

let sut: ReceivedCheckPayloadService
let compressionService: ICompressionService
let dataServiceMock: IReceivedCheckPayloadDataService

const DataServiceMock = jest.fn<IReceivedCheckPayloadDataService, any>(() => ({
  fetchCompressedArchive: jest.fn(),
  fetchArchivesForSchool: jest.fn()
}))

const CompressionServiceMock = jest.fn<ICompressionService, any>(() => ({
  compress: jest.fn(),
  decompress: jest.fn()
}))

describe('received-check-payload.service', () => {
  beforeEach(() => {
    compressionService = new CompressionServiceMock()
    dataServiceMock = new DataServiceMock()
    sut = new ReceivedCheckPayloadService(compressionService, dataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('fetch', () => {
    test('error should be thrown when checkCode is empty string', async () => {
      await expect(sut.fetch('')).rejects.toThrow(/checkCode is required/)
    })

    test('error should be thrown when checkCode is not a valid UUID', async () => {
      const checkCode: string = 'foo'
      await expect(sut.fetch(checkCode)).rejects.toThrow(/checkCode is not a valid UUID/)
    })

    test('if check not found undefined is returned', async () => {
      jest.spyOn(dataServiceMock, 'fetchCompressedArchive').mockResolvedValue(undefined)
      const checkCode: string = '721fdee4-26ef-4111-8bbf-b2c5a7d602e3'
      await expect(sut.fetch(checkCode)).resolves.toBeUndefined()
    })

    test('returns json message with expected properties when found', async () => {
      const mockArchive = 'foo-bar-qux'
      jest.spyOn(dataServiceMock, 'fetchCompressedArchive').mockResolvedValue(mockArchive)
      const checkCode: string = '721fdee4-26ef-4111-8bbf-b2c5a7d602e3'
      const schoolUUID: string = '1f5ac7e4-2d79-4ee2-aa22-362cedcb11af'
      const decompressedArchive = {
        checkCode: checkCode,
        schoolUUID: schoolUUID
      }
      jest.spyOn(compressionService, 'decompress').mockReturnValue(decompressedArchive)
      const message = await sut.fetch(checkCode)
      if (message === undefined) fail('message not defined')
      expect(message.checkCode).toStrictEqual(checkCode)
      expect(message.schoolUUID).toStrictEqual(schoolUUID)
      expect(message.version).toStrictEqual(2)
      expect(message.archive).toStrictEqual(mockArchive)
    })
  })

  describe('fetchBySchool', () => {
    test('error should be thrown when schoolUuid is empty string', async () => {
      await expect(sut.fetchBySchool('')).rejects.toThrow(/schoolUuid is required/)
    })

    test('error should be thrown when schoolUuid is not a valid UUID', async () => {
      const schoolUuid: string = 'foo'
      await expect(sut.fetchBySchool(schoolUuid)).rejects.toThrow(/schoolUuid is not a valid UUID/)
    })

    test('if no checks found empty array is returned', async () => {
      jest.spyOn(dataServiceMock, 'fetchArchivesForSchool').mockResolvedValue([])
      const schoolUuid: string = '721fdee4-26ef-4111-8bbf-b2c5a7d602e3'
      await expect(sut.fetchBySchool(schoolUuid)).resolves.toStrictEqual([])
    })
  })
})
