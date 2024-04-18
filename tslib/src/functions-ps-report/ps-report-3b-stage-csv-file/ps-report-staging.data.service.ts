import { BlobServiceClient } from '@azure/storage-blob'
import type { ILogger } from '../../common/logger'
import config from '../../config'

export class PsReportStagingDataService {
  private readonly logName = 'PsReportStagingDataService'
  private readonly blobService: BlobServiceClient
  private readonly blobName: string
  private readonly csvLineTerminator = '\r\n'
  private readonly containerName

  constructor (private readonly logger: ILogger, containerName = 'ps-report-bulk-upload', blobName = 'ps-report-staging.csv') {
    if (config.ServiceBus.ConnectionString === undefined) {
      throw new Error('ServiceBus ConnectionString is not defined in the environment')
    }
    this.blobName = blobName
    this.containerName = containerName
    this.logger.verbose(`${this.logName} constructor entered`)
    this.blobService = BlobServiceClient.fromConnectionString(config.AzureStorage.ConnectionString)
  }

  /**
   * Create a zero sized append block.
   */
  public async createAppendBlock (): Promise<void> {
    const containerService = this.blobService.getContainerClient(this.containerName)
    await containerService.createIfNotExists()
    const appendBlobService = containerService.getAppendBlobClient(this.blobName)
    await appendBlobService.create()
  }

  /**
   * Appends data to a file in blob storage, creating the file if needed.
   */
  public async appendDataToBlob (data: string): Promise<void> {
    try {
      // Add a newLine if there isn't one at the end.
      if (data.slice(-this.csvLineTerminator.length) !== this.csvLineTerminator) {
        data += this.csvLineTerminator
      }
      const containerService = this.blobService.getContainerClient(this.containerName)
      const appendBlobService = containerService.getAppendBlobClient(this.blobName)
      await appendBlobService.appendBlock(data, data.length)
    } catch (e: any) {
      this.logger.error(`${this.logName}: Failed to append data to ${this.blobName}\n${e?.message}\n`)
    }
  }
}
