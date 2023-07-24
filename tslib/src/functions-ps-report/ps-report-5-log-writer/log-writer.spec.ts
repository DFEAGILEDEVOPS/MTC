import { type IBlobService } from '../../azure/blob-service'
import { type IPsReportLogSetBatch } from './ps-report-log-set'
import { PsLogWriter, LogContainerPrefix } from './log-writer'

let sut: PsLogWriter
const DataServiceMock = jest.fn<IBlobService, any>(() => ({
  createBlob: jest.fn(),
  deleteBlob: jest.fn(),
  appendBlob: jest.fn()
}))

let dataService: IBlobService

describe('ps report log writer', () => {
  beforeEach(() => {
    dataService = new DataServiceMock()
    sut = new PsLogWriter(dataService)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should write each log file to the same blob storage container', async () => {
    const logSet: IPsReportLogSetBatch = {
      setId: '[the-set-id]',
      listSchoolsLog: ['sdfsdfdsfsdfsd', 'erh43h5ehergdr', 'rdgfds', 'xxxdf'],
      pupilDataLog: ['sldfjdslkfj', '3408gwaehiow4ty8'],
      transformerLog: ['wouergh', 'o8324thof48g4', '3o84ghegopijey4p9u'],
      writerLog: ['sldfjsdklfj']
    }
    const expectedListSchoolsFileName = `list-schools-log-${logSet.setId}.txt`
    const expectedPupilDataFileName = `pupil-data-log-${logSet.setId}.txt`
    const expectedTransformerFileName = `transformer-log-${logSet.setId}.txt`
    const expectedWriterFileName = `writer-log-${logSet.setId}.txt`
    const expectedContainerName = `${LogContainerPrefix}-${logSet.setId}`

    await sut.writeToStorage(logSet)
    expect(dataService.appendBlob).toHaveBeenCalledTimes(4)
    expect(dataService.appendBlob).toHaveBeenNthCalledWith(1, Buffer.from(`\n${logSet.listSchoolsLog.join('\n')}`), expectedListSchoolsFileName, expectedContainerName)
    expect(dataService.appendBlob).toHaveBeenNthCalledWith(2, Buffer.from(`\n${logSet.pupilDataLog.join('\n')}`), expectedPupilDataFileName, expectedContainerName)
    expect(dataService.appendBlob).toHaveBeenNthCalledWith(3, Buffer.from(`\n${logSet.transformerLog.join('\n')}`), expectedTransformerFileName, expectedContainerName)
    expect(dataService.appendBlob).toHaveBeenNthCalledWith(4, Buffer.from(`\n${logSet.writerLog.join('\n')}`), expectedWriterFileName, expectedContainerName)
  })

  test('it should not attempt to append blob data if a set item is empty', async () => {
    const logSet: IPsReportLogSetBatch = {
      setId: '[the-set-id]',
      listSchoolsLog: [],
      pupilDataLog: ['sldfjdslkfj', '3408gwaehiow4ty8'],
      transformerLog: ['wouergh', 'o8324thof48g4', '3o84ghegopijey4p9u'],
      writerLog: ['sldfjsdklfj']
    }
    await sut.writeToStorage(logSet)
    expect(dataService.appendBlob).toHaveBeenCalledTimes(3)
  })
})
