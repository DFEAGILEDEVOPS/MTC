import { IPsReportLogEntry, PsReportSource } from '../common/ps-report-log-entry'
import { IPsReportLogSet } from './ps-report-log-set'
import { PsLogEntryFormatter } from './log-entry-formatter'

export class PsLogGeneratorService {
  private readonly formatter = new PsLogEntryFormatter()
  private readonly listSchoolsLog = new Array<string>()
  private readonly pupilDataLog = new Array<string>()
  private readonly transformerLog = new Array<string>()
  private readonly writerLog = new Array<string>()

  generate (entries: IPsReportLogEntry[]): IPsReportLogSet {
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index]
      const formattedEntry = this.formatter.formatEntry(entry)
      switch (entry.source) {
        case PsReportSource.PupilGenerator:
          this.pupilDataLog.push(formattedEntry)
          break
        case PsReportSource.SchoolGenerator:
          this.listSchoolsLog.push(formattedEntry)
          break
        case PsReportSource.Transformer:
          this.transformerLog.push(formattedEntry)
          break
        case PsReportSource.Writer:
          this.writerLog.push(formattedEntry)
          break
        default:
          throw new Error(`unhandled function source: ${entry.source}`)
      }
    }
    return {
      ListSchoolsLog: this.listSchoolsLog,
      PupilDataLog: this.pupilDataLog,
      TransformerLog: this.transformerLog,
      WriterLog: this.writerLog
    }
  }
}
