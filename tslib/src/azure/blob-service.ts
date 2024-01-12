import { BlobServiceClient, ContainerSASPermissions, type ContainerClient } from '@azure/storage-blob'
import config from '../config'
import moment from 'moment'

export interface IBlobService {
  deleteBlob (blobName: string, containerName: string): Promise<void>
  createBlob (data: Buffer, blobName: string, containerName: string): Promise<void>
  appendBlob (data: Buffer, blobName: string, containerName: string): Promise<void>
}

export class BlobService implements IBlobService {
  async appendBlob (data: Buffer, blobName: string, containerName: string): Promise<void> {
    const client = await this.getContainerClient(containerName)
    await client.createIfNotExists()
    const blobClient = client.getAppendBlobClient(blobName)
    await blobClient.createIfNotExists()
    await blobClient.appendBlock(data, data.length)
  }

  async createBlob (data: Buffer, blobName: string, containerName: string): Promise<void> {
    const client = await this.getContainerClient(containerName)
    await client.createIfNotExists()
    const blobClient = client.getBlobClient(blobName)
    const blockClient = blobClient.getBlockBlobClient()
    await blockClient.uploadData(data)
  }

  private async getContainerClient (containerName: string): Promise<ContainerClient> {
    const bsc = BlobServiceClient.fromConnectionString(config.AzureStorage.ConnectionString)
    return bsc.getContainerClient(containerName)
  }

  async deleteBlob (blobName: string, containerName: string): Promise<void> {
    const client = await this.getContainerClient(containerName)
    const blobClient = client.getBlobClient(blobName)
    await blobClient.deleteIfExists()
  }

  async getContainerUrl (containerName: string): Promise<string> {
    const client = await this.getContainerClient(containerName)
    return client.url
  }

  async getContainerReadWriteSasToken (containerName: string): Promise<string> {
    const client = await this.getContainerClient(containerName)
    const startDate = moment().subtract(5, 'minutes')
    const expiryDate = moment().add(2, 'hours') // Educated guess at the time of writing.  Needs to be long enough for 650K records to be transferred and loaded.
    const permissions = new ContainerSASPermissions()
    permissions.read = true
    permissions.delete = true
    return client.generateSasUrl({
      permissions,
      startsOn: startDate.toDate(),
      expiresOn: expiryDate.toDate()
    })
  }
}
