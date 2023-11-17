
import { BlobServiceClient } from '@azure/storage-blob'
import config from '../../../../config'

export interface IPsReportLogsDataService {
  getContainerList (): Promise<string[]>
}

export class PsReportLogsDataService {
  public static async getContainerList (): Promise<string[]> {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const list = new Array<string>()
    for await (const container of client.listContainers({ includeMetadata: false })) {
      list.push(container.name)
    }
    return list
  }

  public static async getFileContents (containerName: string, logFileName: string): Promise<string | undefined> {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    if (!await containerClient.exists()) return
    const blobClient = containerClient.getBlobClient(logFileName)
    if (!await blobClient.exists()) return
    // 1GB limit on 32bit, 2GB limit on 64bit...
    const blobBuffer = await blobClient.downloadToBuffer()
    return blobBuffer.toString()
  }

  public static async getContainerFileList (containerName: string): Promise<IPsReportLogFileData[]> {
    const client = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = client.getContainerClient(containerName)
    if (!await containerClient.exists()) return []
    const files = new Array<IPsReportLogFileData>()
    // properties.contentLength unt is bytes
    for await (const file of containerClient.listBlobsFlat({ includeDeleted: false })) {
      files.push({
        byteLength: file.properties?.contentLength ?? 0,
        name: file.name
      })
    }
    return files
  }
}

export interface IPsReportLogFileData {
  name: string
  byteLength: number
}
