import moment from 'moment'
import { PsReportSource, type IPsReportLogEntry } from '../common/ps-report-log-entry'
import type { IPsLogWriter } from './log-writer'
import { LogService } from './log.service'
import type { IServiceBusMessageLike } from './service-bus-message-like'

const LogWriterMock = jest.fn<IPsLogWriter, any>(() => ({
  writeToStorage: jest.fn()
}))

let sut: LogService
let logWriter: IPsLogWriter

const entries: IPsReportLogEntry[] = [
  {
    generatedAt: moment('2021-12-15 18:43:12'),
    message: 'this is a test message',
    source: PsReportSource.PupilGenerator,
    level: 'info'
  },
  {
    generatedAt: moment('2021-12-15 18:44:02'),
    message: 'this is a test message',
    source: PsReportSource.SchoolGenerator,
    level: 'error'
  },
  {
    generatedAt: moment('2021-12-15 18:45:11'),
    message: 'this is a test message',
    source: PsReportSource.Transformer,
    level: 'verbose'
  },
  {
    generatedAt: moment('2021-12-15 18:45:19'),
    message: 'this is a test message',
    source: PsReportSource.Writer,
    level: 'warning'
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
    const setId = 'foo-bar'
    jest.spyOn(logWriter, 'writeToStorage').mockImplementation()
    await sut.create(setId, messages)
    expect(logWriter.writeToStorage).toHaveBeenCalledTimes(1)
  })
})
