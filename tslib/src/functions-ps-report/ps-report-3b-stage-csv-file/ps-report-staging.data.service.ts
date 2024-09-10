import { BlobServiceClient, type AppendBlobClient } from '@azure/storage-blob'
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
    this.logger.verbose(`Con Str ${config.AzureStorage.ConnectionString}`)
    this.blobService = BlobServiceClient.fromConnectionString(config.AzureStorage.ConnectionString)
  }

  public async getAppendBlobService (): Promise<AppendBlobClient> {
    this.logger.info('container name', this.containerName)
    this.logger.info('blob service', this.blobName)
    const containerService = this.blobService.getContainerClient(this.containerName)
    // Create the container if missing
    await containerService.createIfNotExists()
    const appendBlobService = containerService.getAppendBlobClient(this.blobName)
    return appendBlobService
  }

  /**
   * Create a zero sized append block.
   */
  public async createAppendBlock (): Promise<void> {
    const appendBlobService = await this.getAppendBlobService()
    await appendBlobService.deleteIfExists()
    const res = await appendBlobService.createIfNotExists({ blobHTTPHeaders: { blobContentType: 'text/csv', blobContentEncoding: 'UTF-16LE' } })
    // @azure/storage-blob v12.24.0
    // Will return an error value rather than throw an error as well as give a 'succeeded=true'.  This version does not work.
    /* eslint-disable */
    // @ts-ignore broken type on @azure/storage-blob
    if (res?.body?.Code === 'AuthenticationFailed') {
      console.error('Error response', res)
      // @ts-ignore broken type on @azure/storage-blob
      throw new Error(`Failed to create append blob: ${res?.body?.Message}`)
    }
    /* eslint-enable */
    // Write a BOM to indicate this file is utf-16le
    const utf16leBOM = Buffer.from([0xFF, 0xFE])
    await appendBlobService.appendBlock(utf16leBOM, utf16leBOM.length) // zero width no break space character is the accepted BOM for utf-16le FE FF
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

      // convert string to utf16le
      const utf16Buf = Buffer.from(data, 'utf16le')

      const appendBlobService = await this.getAppendBlobService()
      await appendBlobService.appendBlock(utf16Buf, utf16Buf.length)
    } catch (e: any) {
      console.warn('Error writing to append block: ', e?.message)
      this.logger.error(`${this.logName}: Failed to append data to ${this.blobName}\n${e?.message}\n`)
    }
  }
}
