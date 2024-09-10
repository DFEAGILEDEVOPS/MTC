import { PsReportStagingDataService } from '../functions-ps-report/ps-report-3b-stage-csv-file/ps-report-staging.data.service'
import { ConsoleLogger, type ILogger } from '../common/logger'
import * as iconv from 'iconv-lite'

describe('PS Report 3b Stage CSV File Data Service', () => {
  let logger: ILogger
  let sut: PsReportStagingDataService

  beforeEach(async () => {
    logger = new ConsoleLogger()
    sut = new PsReportStagingDataService(logger)
    const appendBlobClient = await sut.getAppendBlobService()
    await appendBlobClient.deleteIfExists()
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it can create an append block', async () => {
    await sut.createAppendBlock()
    const appendBlobClient = await sut.getAppendBlobService()
    expect(appendBlobClient).toBeDefined()
    const res = await appendBlobClient.exists()
    expect(res).toBe(true)
  })

  test('it can append to an append block', async () => {
    await sut.createAppendBlock()
    const appendBlobClient = await sut.getAppendBlobService()
    const data = 'test, one, three\r\n' // must end in \r\n - for CSV files - or the services appends this to the data
    await sut.appendDataToBlob(data)
    // the CSV file is in UTF16-le encoding
    const buffer = await appendBlobClient.downloadToBuffer()
    // decode it to utf8 for compare
    const returnedData = iconv.decode(buffer, 'utf16le', { stripBOM: true })
    // const expectedBuffer = Buffer.from('\ufeff' + data + '\r\n', 'utf16le') // potentially useful debug
    expect(returnedData).toStrictEqual(data)
  })
})
