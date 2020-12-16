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

export interface TableStorageEntity {
  PartitionKey: string
  RowKey: string
}

export interface InsertResponse {
  '.metadata': { etag: string }
}

export interface DeleteResponse {
  isSuccessful: boolean
  statusCode: number // e.g. 204
}

export interface IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<Error | TableStorageEntity>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken: az.TableService.TableContinuationToken): Promise<Error | any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<Error | DeleteResponse>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<Error | InsertResponse>
  retrieveEntityAsync (table: string, partitionKey: string, rowKey: string): Promise<Error | any>
}
export class AsyncTableService extends az.TableService implements IAsyncTableService {

  async retrieveEntityAsync (table: string, partitionKey: string, rowKey: string): Promise<Error | any> {
    return new Promise((resolve, reject) => {
      this.retrieveEntity(table, partitionKey, rowKey, (error, result) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  async replaceEntityAsync (table: string, entity: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      this.replaceEntity(table, entity, (error, result) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  async queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken: az.TableService.TableContinuationToken): Promise<Error | any> {
    return new Promise((resolve, reject) => {
      this.queryEntities(table, tableQuery, currentToken, (error, result) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  async deleteEntityAsync (table: string, entityDescriptor: unknown): Promise<Error | DeleteResponse> {
    return new Promise((resolve, reject) => {
      this.deleteEntity(table, entityDescriptor, (error, result) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  async insertEntityAsync (table: string, entityDescriptor: unknown): Promise<Error | InsertResponse> {
    return new Promise((resolve, reject) => {
      this.insertEntity(table, entityDescriptor, (error, result) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

export interface IBlobStorageService {
  deleteContainerAsync (containerName: string): Promise<void>
  deleteBlobAsync (blobName: string, containerName: string): Promise<void>
}

export interface IBlobStorageHelper {
  getPromisifiedAzureBlobService (): IBlobStorageService
}

export class AsyncBlobService extends az.BlobService implements IBlobStorageService {
  constructor () {
    super(config.AzureStorage.ConnectionString)
  }

  async deleteContainerAsync (container: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.deleteContainer(container, (error) => {
        if (isNotNil(error)) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
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
