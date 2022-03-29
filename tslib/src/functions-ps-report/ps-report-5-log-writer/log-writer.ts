import { IPsReportLogSet } from './models'
import { BlobService, IBlobService } from '../../azure/blob-service'
import { DateTimeService, IDateTimeService } from '../../common/datetime.service'
export interface IPsLogWriter {
  writeToStorage (logSet: IPsReportLogSet): Promise<void>
}

export const LogContainerPrefix = 'ps-report-log'
export class PsLogWriter implements IPsLogWriter {
  private readonly dataService: IBlobService
  private readonly dateTimeService: IDateTimeService

  constructor (dataService?: IBlobService, dateTimeService?: IDateTimeService) {
    this.dataService = dataService ?? new BlobService()
    this.dateTimeService = dateTimeService ?? new DateTimeService()
  }

  async writeToStorage (logSet: IPsReportLogSet): Promise<void> {
    const listSchoolsBuffer = Buffer.from(logSet.ListSchoolsLog.join('\n'))
    const pupilDataBuffer = Buffer.from(logSet.PupilDataLog.join('\n'))
    const transformerBuffer = Buffer.from(logSet.TransformerLog.join('\n'))
    const writerBuffer = Buffer.from(logSet.WriterLog.join('\n'))

    const dateTimeStamp = this.dateTimeService.utcNow().format('YYYYMMDDHHmmss')
    const containerName = `${LogContainerPrefix}-${dateTimeStamp}`

    const listSchoolsFileName = `list-schools-log-${dateTimeStamp}.txt`
    const pupilDataFileName = `pupil-data-log-${dateTimeStamp}.txt`
    const transformerFileName = `transformer-log-${dateTimeStamp}.txt`
    const writerFileName = `writer-log-${dateTimeStamp}.txt`

    await Promise.all([
      this.dataService.createBlob(listSchoolsBuffer, listSchoolsFileName, containerName),
      this.dataService.createBlob(pupilDataBuffer, pupilDataFileName, containerName),
      this.dataService.createBlob(transformerBuffer, transformerFileName, containerName),
      this.dataService.createBlob(writerBuffer, writerFileName, containerName)
    ])
  }
}
