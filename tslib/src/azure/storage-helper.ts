import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import config from '../config'
import * as az from 'azure-storage'
import { isNotNil } from 'ramda-adjunct'

const globalDotEnvFile = path.join(__dirname, '..', '..', '..', '.env')
try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    dotenv.config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
export interface IBlobStorageService {
  deleteBlobAsync (blobName: string, containerName: string): Promise<void>
}

export class AsyncBlobService extends az.BlobService implements IBlobStorageService {
  constructor () {
    super(config.AzureStorage.ConnectionString)
  }

  async deleteBlobAsync (blobName: string, containerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.deleteBlob(containerName, blobName, (error) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }
}
