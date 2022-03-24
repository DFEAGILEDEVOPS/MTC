import moment from 'moment'
import { IPsReportLogEntry, PsReportSource } from '../../schemas/ps-report-log-entry'
import { IPsLogWriter } from './log-writer'
import { IServiceBusMessageLike, LogService } from './log.service'

const LogWriterMock = jest.fn<IPsLogWriter, any>(() => ({
  writeToStorage: jest.fn()
}))

let sut: LogService
let logWriter: IPsLogWriter

const entries: IPsReportLogEntry[] = [
  {
    generatedAt: moment('2021-12-15 18:43:12'),
    message: 'this is a test message',
    source: PsReportSource.PupilGenerator
  },
  {
    generatedAt: moment('2021-12-15 18:44:02'),
    message: 'this is a test message',
    source: PsReportSource.SchoolGenerator
  },
  {
    generatedAt: moment('2021-12-15 18:45:11'),
    message: 'this is a test message',
    source: PsReportSource.Transformer
  },
  {
    generatedAt: moment('2021-12-15 18:45:19'),
    message: 'this is a test message',
    source: PsReportSource.Writer
  }
]

const messages: IServiceBusMessageLike[] = entries.map(e => {
  return {
    body: e
  }
})

describe('log service', () => {
  beforeEach(() => {
    logWriter = new LogWriterMock()
    sut = new LogService(logWriter)
  })

  test('subject is defined', () => {
    expect(sut).toBeDefined()
  })

  test('orchestrates parsing, formatting and writing of log files', async () => {
    jest.spyOn(logWriter, 'writeToStorage').mockImplementation()
    await sut.create(messages)
    expect(logWriter.writeToStorage).toHaveBeenCalledTimes(1)
  })
})
