import { IPsLogBlobStorageDataService, PsLogBlobStorageDataService } from './ps-log-blob.data.service'
import { IPsReportLogSet } from './log-generator.service'

export class PsLogWriter {
  private readonly dataService: IPsLogBlobStorageDataService

  constructor (dataService?: IPsLogBlobStorageDataService) {
    this.dataService = dataService ?? new PsLogBlobStorageDataService()
  }

  async writeToStorage (logSet: IPsReportLogSet, containerName: string): Promise<void> {
    await this.dataService.createContainerIfNotExists(containerName)
    await Promise.all([
      this.dataService.createBlobTextFile(logSet.ListSchoolsLog.join('\n'), 'list-schools.txt', containerName),
      this.dataService.createBlobTextFile(logSet.PupilDataLog.join('\n'), 'pupil-data.txt', containerName),
      this.dataService.createBlobTextFile(logSet.TransformerLog.join('\n'), 'transformer.txt', containerName),
      this.dataService.createBlobTextFile(logSet.WriterLog.join('\n'), 'writer.txt', containerName)
    ])
  }
}
