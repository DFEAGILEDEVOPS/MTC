import { IPsReportLogSet } from './log-generator.service'
import { PsLogWriter } from './log-writer'
import { IPsLogBlobStorageDataService } from './ps-log-blob.data.service'

let sut: PsLogWriter
const DataServiceMock = jest.fn<IPsLogBlobStorageDataService, any>(() => ({
  createBlobTextFile: jest.fn(),
  createContainerIfNotExists: jest.fn()
}))
let dataService: IPsLogBlobStorageDataService

describe('ps report log writer', () => {
  beforeEach(() => {
    dataService = new DataServiceMock()
    sut = new PsLogWriter(dataService)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should create a container for todays log files', async () => {
    const logSet: IPsReportLogSet = {
      ListSchoolsLog: ['sldkfjsdlkfj'],
      PupilDataLog: ['sldfjdslkfj'],
      TransformerLog: ['wouergh'],
      WriterLog: ['sldfjsdklfj']
    }
    const containerName = 'foo'
    await sut.writeToStorage(logSet, containerName)
    expect(dataService.createContainerIfNotExists).toHaveBeenCalledWith(containerName)
  })

  test('it should write each log file to blob storage container', async () => {
    const logSet: IPsReportLogSet = {
      ListSchoolsLog: ['sldkfjsdlkfj'],
      PupilDataLog: ['sldfjdslkfj'],
      TransformerLog: ['wouergh'],
      WriterLog: ['sldfjsdklfj']
    }
    const containerName = 'foo'
    await sut.writeToStorage(logSet, containerName)
    expect(dataService.createBlobTextFile).toHaveBeenCalledTimes(4)
    expect(dataService.createBlobTextFile).toHaveBeenNthCalledWith(1, logSet.ListSchoolsLog.join('\n'), 'list-schools.txt', containerName)
    expect(dataService.createBlobTextFile).toHaveBeenNthCalledWith(2, logSet.PupilDataLog.join('\n'), 'pupil-data.txt', containerName)
    expect(dataService.createBlobTextFile).toHaveBeenNthCalledWith(3, logSet.TransformerLog.join('\n'), 'transformer.txt', containerName)
    expect(dataService.createBlobTextFile).toHaveBeenNthCalledWith(4, logSet.WriterLog.join('\n'), 'writer.txt', containerName)
  })
})
