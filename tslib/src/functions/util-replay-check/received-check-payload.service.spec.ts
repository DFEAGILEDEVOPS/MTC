import { CompressionService } from '../../common/compression-service'
import { type IReceivedCheckPayloadDataService } from './received-check-payload.data.service'
import { ReceivedCheckPayloadService } from './received-check-payload.service'
import mockCompleteCheck from '../../schemas/large-complete-check-V2.json'

let sut: ReceivedCheckPayloadService
let compressionService: CompressionService
let dataServiceMock: IReceivedCheckPayloadDataService

const DataServiceMock = jest.fn<IReceivedCheckPayloadDataService, any>(() => ({
  fetchCompressedArchives: jest.fn(),
  fetchArchivesForSchool: jest.fn()
}))

describe('received-check-payload.service', () => {
  beforeEach(() => {
    compressionService = new CompressionService()
    dataServiceMock = new DataServiceMock()
    sut = new ReceivedCheckPayloadService(compressionService, dataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('fetch', () => {
    test('error should be thrown when checkCodes array is empty', async () => {
      const checkCodes: string[] = []
      await expect(sut.fetch(checkCodes)).rejects.toThrow(/at least 1 checkCode is required/)
    })

    test('error should be thrown when at least one checkCode is not a valid UUID', async () => {
      const checkCodes = ['82fe6ebd-4933-49b5-accd-4dc78b7303f7', 'foo', 'b1f3f5c0-78ed-417b-b6d9-61280f795eb2']
      await expect(sut.fetch(checkCodes)).rejects.toThrow(/checkCode 'foo' is not a valid UUID/)
    })

    test('if check not found empty array is returned', async () => {
      jest.spyOn(dataServiceMock, 'fetchCompressedArchives').mockResolvedValue([])
      const checkCodes = ['721fdee4-26ef-4111-8bbf-b2c5a7d602e3']
      const response = await sut.fetch(checkCodes)
      expect(response).toStrictEqual([])
    })

    test('returns array containing json message with expected properties when found', async () => {
      const mockArchive = compressionService.compressToUTF16(JSON.stringify(mockCompleteCheck))
      jest.spyOn(dataServiceMock, 'fetchCompressedArchives').mockResolvedValue([mockArchive])
      const checkCodes = [mockCompleteCheck.checkCode]
      const schoolUUID: string = mockCompleteCheck.schoolUUID
      const response = await sut.fetch(checkCodes)
      if (response === undefined) fail('response not defined')
      expect(response).toHaveLength(1)
      expect(response[0].checkCode).toStrictEqual(checkCodes[0])
      expect(response[0].schoolUUID).toStrictEqual(schoolUUID)
      expect(response[0].version).toBe(2)
      expect(response[0].archive).toStrictEqual(mockArchive)
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

    test('returns json array of submitted check messages when found', async () => {
      const mockDataServiceResponse = [
        {
          checkCode: '123',
          archive: 'abc'
        },
        {
          checkCode: '456',
          archive: 'def'
        },
        {
          checkCode: '789',
          archive: 'ghi'
        }
      ]
      jest.spyOn(dataServiceMock, 'fetchArchivesForSchool').mockResolvedValue(mockDataServiceResponse)
      const schoolUUID: string = '1f5ac7e4-2d79-4ee2-aa22-362cedcb11af'
      const messages = await sut.fetchBySchool(schoolUUID)
      if (messages === undefined) fail('message not defined')
      expect(messages).toHaveLength(3)
      const message1 = messages[0]
      expect(message1.archive).toBe('abc')
      expect(message1.checkCode).toBe('123')
      expect(message1.schoolUUID).toStrictEqual(schoolUUID)
      expect(message1.version).toBe(2)
      const message2 = messages[1]
      expect(message2.archive).toBe('def')
      expect(message2.checkCode).toBe('456')
      expect(message2.schoolUUID).toStrictEqual(schoolUUID)
      expect(message2.version).toBe(2)
      const message3 = messages[2]
      expect(message3.archive).toBe('ghi')
      expect(message3.checkCode).toBe('789')
      expect(message3.schoolUUID).toStrictEqual(schoolUUID)
      expect(message3.version).toBe(2)
    })
  })
})
