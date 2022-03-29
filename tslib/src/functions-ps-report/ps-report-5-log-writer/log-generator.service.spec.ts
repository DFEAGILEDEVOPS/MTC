import moment from 'moment'
import { IPsReportLogEntry, PsReportSource } from '../common/ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'
import { PsLogGeneratorService } from './log-generator.service'
import { IPsReportLogSet } from './ps-report-log-set'

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

  test('it returns log set containing formatted messages', () => {
    const pupilGeneratorMessage: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:00:00'),
      message: 'foo',
      source: PsReportSource.PupilGenerator,
      level: 'error'
    }
    const transformerMessage: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:00:03'),
      message: 'bar',
      source: PsReportSource.Transformer,
      level: 'info'
    }
    const writerMessage: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:11:00'),
      message: 'qux',
      source: PsReportSource.Writer,
      level: 'warning'
    }
    const expected: IPsReportLogSet = {
      ListSchoolsLog: [],
      PupilDataLog: [formatter.formatEntry(pupilGeneratorMessage)],
      TransformerLog: [formatter.formatEntry(transformerMessage)],
      WriterLog: [formatter.formatEntry(writerMessage)]
    }
    const actual = sut.generate([pupilGeneratorMessage, transformerMessage, writerMessage])
    expect(actual).toStrictEqual(expected)
  })
})
