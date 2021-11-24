import { CompressionService } from '../../common/compression-service'
import { IReceivedCheckPayloadDataService } from './received-check-payload.data.service'
import { ReceivedCheckPayloadService } from './received-check-payload.service'

let sut: ReceivedCheckPayloadService
let compressionService: CompressionService
let dataServiceMock: IReceivedCheckPayloadDataService

const DataServiceMock = jest.fn<IReceivedCheckPayloadDataService, any>(() => ({
  fetchCompressedArchive: jest.fn()
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

  test('error should be thrown when checkCode is empty string', async () => {
    await expect(sut.fetch('')).rejects.toThrow(/checkCode is required/)
  })

  test('error should be thrown when checkCode is not a valid UUID', async () => {
    const checkCode: string = 'foo'
    await expect(sut.fetch(checkCode)).rejects.toThrow(/checkCode is not a valid UUID/)
  })

  test('if check not found empty string returned', async () => {
    jest.spyOn(dataServiceMock, 'fetchCompressedArchive').mockResolvedValue(undefined)
    const checkCode: string = '721fdee4-26ef-4111-8bbf-b2c5a7d602e3'
    await expect(sut.fetch(checkCode)).resolves.toBe('')
  })
})
