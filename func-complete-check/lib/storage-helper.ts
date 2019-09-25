import 'dotenv/config'
import * as az from 'azure-storage'
import bluebird from 'bluebird'

export interface IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<any>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken): Promise<any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
}

export class AsyncTableService extends az.TableService implements IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<any> {
    return this.replaceEntityAsync(table, entity)
  }
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken | undefined): Promise<any> {
    return this.queryEntitiesAsync(table, tableQuery, currentToken)
  }
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any> {
    return this.deleteEntityAsync(table, entityDescriptor)
  }
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions | undefined): Promise<any> {
    return this.insertEntityAsync(table, entityDescriptor, options)
  }
  constructor () {
    super()
    bluebird.promisifyAll(this, {
      promisifier: (originalFunction) => function (this: any, ...args) {
        return new Promise((resolve, reject) => {
          try {
            originalFunction.call(this, ...args, (error: any, result: any, response: any) => {
              if (error) {
                return reject(error)
              }
              resolve({ result, response })
            })
          } catch (error) {
            reject(error)
          }
        })
      }
    })
  }
}
