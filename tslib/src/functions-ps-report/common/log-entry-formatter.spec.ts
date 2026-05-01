import moment from 'moment'
import { type IPsReportLogEntry, PsReportSource } from './ps-report-log-entry.js'
import { PsLogEntryFormatter } from './log-entry-formatter.js'

let sut: PsLogEntryFormatter

describe('log entry formatter', () => {
  beforeEach(() => {
    sut = new PsLogEntryFormatter()
  })

  test('returns formatted string', () => {
    const invocationId = '11111111-2222-3333-4444-555555555555'
    const message: IPsReportLogEntry = {
      generatedAt: moment('2022-03-18 14:43:02'),
      message: 'foo-bar',
      source: PsReportSource.PupilGenerator,
      level: 'info',
      invocationId
    }
    const output = sut.formatEntry(message)
    const expectedOutput = `${message.generatedAt.toISOString()}: [${message.source}] ${message.level} ${invocationId} - ${message.message}`
    expect(output).toStrictEqual(expectedOutput)
  })
})
