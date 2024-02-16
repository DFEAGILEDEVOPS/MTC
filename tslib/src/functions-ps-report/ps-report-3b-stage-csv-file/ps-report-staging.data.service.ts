import { type AppendBlobClient, BlobServiceClient, type ContainerClient } from '@azure/storage-blob'
import type { ILogger } from '../../common/logger'
import config from '../../config'

export class PsReportStagingDataService {
  private readonly logName = 'PsReportStagingDataService'
  private readonly blobService: BlobServiceClient
  private readonly containerService: ContainerClient
  private readonly appendBlobService: AppendBlobClient
  private readonly blobName: string
  private readonly csvLineTerminator = '\n'

  constructor (private readonly logger: ILogger, containerName = 'ps-report-bulk-upload', blobName = 'ps-report-staging.csv') {
    if (config.ServiceBus.ConnectionString === undefined) {
      throw new Error('ServiceBus ConnectionString is not defined in the environment')
    }
    this.blobName = blobName
    this.logger.verbose(`${this.logName} constructor entered`)
    this.blobService = BlobServiceClient.fromConnectionString(config.AzureStorage.ConnectionString)
    this.containerService = this.blobService.getContainerClient(containerName)
    this.appendBlobService = this.containerService.getAppendBlobClient(blobName)
  }

  /**
   * Create a zero sized append block.
   */
  public async createAppendBlock (): Promise<void> {
    await this.appendBlobService.create()
  }

  /**
   * Appends data to a file in blob storage, creating the file if needed.
   */
  public async appendDataToBlob (data: string[]): Promise<void> {
    try {
      const s = data.join(this.csvLineTerminator) + this.csvLineTerminator
      await this.appendBlobService.appendBlock(s, s.length)
    } catch (e: any) {
      this.logger.error(`${this.logName}: Failed to append data to ${this.blobName}\n${e?.message}\n`)
    }
  }
}
