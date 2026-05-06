import moment from 'moment'
import { type IPsReportLogEntry, PsReportSource } from './ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'
import { v4 as uuidv4 } from 'uuid'

let sut: PsLogEntryFormatter

describe('log entry formatter', () => {
  beforeEach(() => {
    sut = new PsLogEntryFormatter()
  })

  test('returns formatted string', () => {
    const invocationId = uuidv4()
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
