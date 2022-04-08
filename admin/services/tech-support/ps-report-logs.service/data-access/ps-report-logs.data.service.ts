
import { BlobServiceClient } from '@azure/storage-blob'
import { familiarisationCheckEndDateAfterAdminEndDate } from 'lib/errors/check-window-v2'
import config from '../../../../config'

export interface IPsReportLogsDataService {
  getContainerList (): Promise<Array<string>>
}

export class PsReportLogsDataService {
  public static async getContainerList (): Promise<Array<string>> {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const list = new Array<string>()
    for await (const container of client.listContainers({ includeMetadata: false })) {
      list.push(container.name)
    }
    return list
  }

  public static async getFileContents (containerName: string, logFileName: string): Promise<string | undefined> {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = await client.getContainerClient(containerName)
    if (!containerClient.exists()) return
    const blobClient = containerClient.getBlobClient(logFileName)
    if (!blobClient.exists()) return
    // 1GB limit on 32bit, 2GB limit on 64bit...
    const blobBuffer = await blobClient.downloadToBuffer()
    return blobBuffer.toString()
  }

  public static async getContainerFileList (containerName: string): Promise<IPsReportLogFile[]> {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = await client.getContainerClient(containerName)
    if (!containerClient.exists()) return []
    const files = new Array<IPsReportLogFile>()
    // properties.contentLength: 7271623 (6.9MB)
    for await (const file of containerClient.listBlobsFlat({ includeDeleted: false })) {
      files.push({
        contentLength: file.properties?.contentLength,
        name: file.name
      })
    }
    return files
  }
}

export interface IPsReportLogFile {
  name: string,
  contentLength?: number
}
