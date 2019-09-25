import 'dotenv/config'
import * as az from 'azure-storage'
const QueryComparisons = az.TableUtilities.QueryComparisons
const TableQuery = az.TableQuery
import bluebird from 'bluebird'
import { Logger } from '@azure/functions'

interface IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<any>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken): Promise<any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
}

export declare class AsyncTableService extends az.TableService implements IAsyncTableService {
  replaceEntityAsync (table: string, entity: any): Promise<any>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken): Promise<any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
}

export declare class StorageError extends Error {
  type: string
}

export class TableStorageHelper {
  private _tableService: AsyncTableService
  constructor (tableService?: AsyncTableService) {
    if (tableService !== undefined) {
      this._tableService = tableService
    } else {
      this._tableService = new AsyncTableService()
    }
  }
}
