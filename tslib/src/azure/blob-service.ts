import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import config from '../config'

export interface IBlobService {
  deleteBlob (blobName: string, containerName: string): Promise<void>
}

export class BlobService implements IBlobService {
  private async getContainerClient (containerName: string): Promise<ContainerClient> {
    const bsc = BlobServiceClient.fromConnectionString(config.AzureStorage.ConnectionString)
    return bsc.getContainerClient(containerName)
  }

  async deleteBlob (blobName: string, containerName: string): Promise<void> {
    const client = await this.getContainerClient(containerName)
    const blobClient = client.getBlobClient(blobName)
    await blobClient.deleteIfExists()
  }
}
