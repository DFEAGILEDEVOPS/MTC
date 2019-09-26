import 'dotenv/config'
import * as az from 'azure-storage'
import bluebird from 'bluebird'

export interface IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<any>
  // queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken): Promise<any>
  // deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  // insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
}

export class AsyncTableService extends az.TableService implements IAsyncTableService {

  replaceEntityAsync (table: string, entity: any): Promise<any> {
    // return this.replaceEntityAsync(table, entity)
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
/*   queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken | undefined): Promise<any> {
    return this.queryEntitiesAsync(table, tableQuery, currentToken)
  }
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any> {
    return this.deleteEntityAsync(table, entityDescriptor)
  }
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions | undefined): Promise<any> {
    return this.insertEntityAsync(table, entityDescriptor, options)
  } */
}
