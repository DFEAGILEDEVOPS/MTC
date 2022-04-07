
import { BlobServiceClient } from '@azure/storage-blob'
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

  public static async getFileContents (containerName: string, fileName: string): Promise<string> {
    throw new Error('not impl')
  }

  public static async getContainerFileList (containerName: string): Promise<string[]> {
    throw new Error('not impl')
  }
}
