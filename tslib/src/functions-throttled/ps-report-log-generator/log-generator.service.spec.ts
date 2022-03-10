import moment from 'moment'
import { IPsReportLogEntry } from '../../schemas/ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'
import { PsLogGeneratorService } from './log-generator.service'

let sut: PsLogGeneratorService
let formatter: PsLogEntryFormatter

describe('log generator service', () => {
  beforeEach(() => {
    sut = new PsLogGeneratorService()
    formatter = new PsLogEntryFormatter()
  })

  test('subject is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it returns string with message on each line prefixed with date', () => {
    const message1: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:00:00'),
      message: 'foo',
      source: 'school-generator'
    }
    const message2: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:00:03'),
      message: 'bar',
      source: 'transformer'
    }
    const message3: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:11:00'),
      message: 'qux',
      source: 'writer'
    }
    let expectedOutput = formatter.formatMessage(message1)
    expectedOutput += '\n' + formatter.formatMessage(message2)
    expectedOutput += '\n' + formatter.formatMessage(message3)
    const output = sut.generate([message1, message2, message3])
    expect(output).toStrictEqual(expectedOutput)
  })
})
