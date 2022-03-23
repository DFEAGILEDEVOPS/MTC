
export interface IPsLogBlobStorageDataService {
  createBlobTextFile (data: string, fileName: string, containerName: string): Promise<void>
  createContainerIfNotExists (containerName: string): Promise<void>
}

export class PsLogBlobStorageDataService implements IPsLogBlobStorageDataService {
  async createBlobTextFile (data: string, fileName: string, containerName: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async createContainerIfNotExists (containerName: string): Promise<void> {
    throw new Error('not impl')
  }
}
