import { type IPsReportLogSetBatch } from './ps-report-log-set'
import { BlobService, type IBlobService } from '../../azure/blob-service'
import { PsLogEntryConverter } from './log-entry.converter'
export interface IPsLogWriter {
  writeToStorage (logSet: IPsReportLogSetBatch): Promise<void>
}

export const LogContainerPrefix = 'ps-report-log'
export class PsLogWriter implements IPsLogWriter {
  private readonly dataService: IBlobService
  private readonly entryConverter = new PsLogEntryConverter()

  constructor (dataService?: IBlobService) {
    this.dataService = dataService ?? new BlobService()
  }

  async writeToStorage (logSet: IPsReportLogSetBatch): Promise<void> {
    const listSchoolsBuffer = this.entryConverter.convert(logSet.listSchoolsLog)
    const pupilDataBuffer = this.entryConverter.convert(logSet.pupilDataLog)
    const transformerBuffer = this.entryConverter.convert(logSet.transformerLog)
    const writerBuffer = this.entryConverter.convert(logSet.writerLog)

    const containerName = `${LogContainerPrefix}-${logSet.setId}`

    const listSchoolsFileName = `list-schools-log-${logSet.setId}.txt`
    const pupilDataFileName = `pupil-data-log-${logSet.setId}.txt`
    const transformerFileName = `transformer-log-${logSet.setId}.txt`
    const writerFileName = `writer-log-${logSet.setId}.txt`

    const promises = new Array<Promise<void>>()
    if (listSchoolsBuffer !== undefined) promises.push(this.dataService.appendBlob(listSchoolsBuffer, listSchoolsFileName, containerName))
    if (pupilDataBuffer !== undefined) promises.push(this.dataService.appendBlob(pupilDataBuffer, pupilDataFileName, containerName))
    if (transformerBuffer !== undefined) promises.push(this.dataService.appendBlob(transformerBuffer, transformerFileName, containerName))
    if (writerBuffer !== undefined) promises.push(this.dataService.appendBlob(writerBuffer, writerFileName, containerName))

    await Promise.all(promises)
  }
}
