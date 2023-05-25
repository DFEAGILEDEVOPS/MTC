import moment from 'moment'
import { type IPsReportLogEntry, PsReportSource } from '../common/ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'

let sut: PsLogEntryFormatter

describe('log entry formatter', () => {
  beforeEach(() => {
    sut = new PsLogEntryFormatter()
  })

  test('returns formatted string', () => {
    const message: IPsReportLogEntry = {
      generatedAt: moment('2022-03-18 14:43:02'),
      message: 'foo-bar',
      source: PsReportSource.PupilGenerator,
      level: 'info'
    }
    const output = sut.formatEntry(message)
    const expectedOutput = `${message.generatedAt.toISOString()}: [${message.source}] ${message.level} - ${message.message}`
    expect(output).toStrictEqual(expectedOutput)
  })
})
