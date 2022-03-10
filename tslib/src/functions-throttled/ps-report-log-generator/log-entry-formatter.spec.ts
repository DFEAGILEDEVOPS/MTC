import moment from 'moment'
import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'
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
      source: 'pupil-generator'
    }
    const output = sut.formatMessage(message)
    const expectedOutput = `${message.generatedAt.toISOString()}: [${message.source}] ${message.message}`
    expect(output).toStrictEqual(expectedOutput)
  })
})
