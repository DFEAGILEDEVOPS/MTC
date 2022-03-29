import moment from 'moment'
import { IPsReportLogEntry, PsReportLogLevel, PsReportSource } from '../common/ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'
import { PsLogGeneratorService } from './log-generator.service'
import { IPsReportLogSet } from './models'

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
      level: PsReportLogLevel.Error
    }
    const transformerMessage: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:00:03'),
      message: 'bar',
      source: PsReportSource.Transformer,
      level: PsReportLogLevel.Info
    }
    const writerMessage: IPsReportLogEntry = {
      generatedAt: moment('2022-03-10 12:11:00'),
      message: 'qux',
      source: PsReportSource.Writer,
      level: PsReportLogLevel.Warning
    }
    const expected: IPsReportLogSet = {
      ListSchoolsLog: [],
      PupilDataLog: [formatter.formatMessage(pupilGeneratorMessage)],
      TransformerLog: [formatter.formatMessage(transformerMessage)],
      WriterLog: [formatter.formatMessage(writerMessage)]
    }
    const actual = sut.generate([pupilGeneratorMessage, transformerMessage, writerMessage])
    expect(actual).toStrictEqual(expected)
  })
})
