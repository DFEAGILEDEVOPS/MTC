import { PsReportStagingDataService } from '../functions-ps-report/ps-report-3b-stage-csv-file/ps-report-staging.data.service'
import { ConsoleLogger, type ILogger } from '../common/logger'

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
    const buffer = await appendBlobClient.downloadToBuffer()
    const returnedData = buffer.toString()
    expect(returnedData).toStrictEqual(data)
  })
})
