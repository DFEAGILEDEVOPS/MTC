import * as path from 'path'
import * as fs from 'fs'
// @ts-ignore
import * as dotenv from 'dotenv'
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
import * as az from 'azure-storage'

export interface TableStorageEntity {
  PartitionKey: string,
  RowKey: string
}

export interface IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<Error | TableStorageEntity>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken: az.TableService.TableContinuationToken): Promise<any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
}

export class AsyncTableService extends az.TableService implements IAsyncTableService {

  replaceEntityAsync (table: string, entity: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.replaceEntity(table, entity, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken: az.TableService.TableContinuationToken): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queryEntities(table, tableQuery, currentToken, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deleteEntity(table, entityDescriptor, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  insertEntityAsync (table: string, entityDescriptor: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      this.insertEntity(table, entityDescriptor, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}
