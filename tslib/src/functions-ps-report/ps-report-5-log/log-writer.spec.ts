import moment from 'moment'
import { IBlobService } from '../../azure/blob-service'
import { IDateTimeService } from '../../common/datetime.service'
import { IPsReportLogSet } from './log-generator.service'
import { PsLogWriter } from './log-writer'

let sut: PsLogWriter
const DataServiceMock = jest.fn<IBlobService, any>(() => ({
  createBlob: jest.fn(),
  deleteBlob: jest.fn()
}))
const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  convertDateToMoment: jest.fn(),
  convertMomentToJsDate: jest.fn(),
  formatIso8601: jest.fn(),
  utcNow: jest.fn()
}))

let dataService: IBlobService
let dateTimeService: IDateTimeService

describe('ps report log writer', () => {
  beforeEach(() => {
    dataService = new DataServiceMock()
    dateTimeService = new DateTimeServiceMock()
    sut = new PsLogWriter(dataService, dateTimeService)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should write each log file to blob storage container', async () => {
    const logSet: IPsReportLogSet = {
      ListSchoolsLog: ['sldkfjsdlkfj'],
      PupilDataLog: ['sldfjdslkfj'],
      TransformerLog: ['wouergh'],
      WriterLog: ['sldfjsdklfj']
    }
    const containerName = 'foo'
    const mockDateTime = moment('2022-03-23 14:50:31')
    jest.spyOn(dateTimeService, 'utcNow').mockReturnValue(mockDateTime)
    const mockDateTimeIsoString = mockDateTime.toISOString()
    const expectedListSchoolsFileName = `list-schools-log-${mockDateTimeIsoString}.txt`
    const expectedPupilDataFileName = `pupil-data-log-${mockDateTimeIsoString}.txt`
    const expectedTransformerFileName = `transformer-log-${mockDateTimeIsoString}.txt`
    const expectedWriterFileName = `writer-log-${mockDateTimeIsoString}.txt`

    await sut.writeToStorage(logSet, containerName)
    expect(dataService.createBlob).toHaveBeenCalledTimes(4)
    expect(dataService.createBlob).toHaveBeenNthCalledWith(1, Buffer.from(logSet.ListSchoolsLog.join('\n')), expectedListSchoolsFileName, containerName)
    expect(dataService.createBlob).toHaveBeenNthCalledWith(2, Buffer.from(logSet.PupilDataLog.join('\n')), expectedPupilDataFileName, containerName)
    expect(dataService.createBlob).toHaveBeenNthCalledWith(3, Buffer.from(logSet.TransformerLog.join('\n')), expectedTransformerFileName, containerName)
    expect(dataService.createBlob).toHaveBeenNthCalledWith(4, Buffer.from(logSet.WriterLog.join('\n')), expectedWriterFileName, containerName)
  })
})
