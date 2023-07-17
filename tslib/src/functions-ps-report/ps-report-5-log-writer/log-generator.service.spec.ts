import moment from 'moment'
import { type IPsReportLogEntry, PsReportSource } from '../common/ps-report-log-entry'
import { PsLogEntryFormatter } from './log-entry-formatter'
import { PsLogSetGeneratorService } from './log-generator.service'
import { type IPsReportLogSetBatch } from './ps-report-log-set'

let sut: PsLogSetGeneratorService
let formatter: PsLogEntryFormatter

describe('log generator service', () => {
  beforeEach(() => {
    sut = new PsLogSetGeneratorService()
    formatter = new PsLogEntryFormatter()
  })

  test('subject is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it returns log set containing formatted messages', () => {
    const setId = 'foo-bar'
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
    const expected: IPsReportLogSetBatch = {
      setId,
      listSchoolsLog: [],
      pupilDataLog: [formatter.formatEntry(pupilGeneratorMessage)],
      transformerLog: [formatter.formatEntry(transformerMessage)],
      writerLog: [formatter.formatEntry(writerMessage)]
    }
    const actual = sut.generate(setId, [pupilGeneratorMessage, transformerMessage, writerMessage])
    expect(actual).toStrictEqual(expected)
  })
})
