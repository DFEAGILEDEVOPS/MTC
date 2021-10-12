import { TableClient, TableEntity, TableInsertEntityHeaders, UpdateEntityResponse } from '@azure/data-tables'
import config from '../config'

export interface ITableService {
  getEntity (tableName: string, partitionKey: string, rowKey: string): Promise<TableEntity<object>>
  replaceEntity (tableName: string, entity: TableEntity<object>): Promise<UpdateEntityResponse>
  createEntity (tableName: string, entity: TableEntity<object>): Promise<TableInsertEntityHeaders>
  mergeUpdateEntity (tableName: string, entity: TableEntity<object>): Promise<UpdateEntityResponse>
}

export class TableService implements ITableService {
  private getClient(tableName: string): TableClient {
    return TableClient.fromConnectionString(config.AzureStorage.ConnectionString, tableName)
  }

  createEntity (tableName: string, entity: TableEntity<object>): Promise<TableInsertEntityHeaders> {
    return this.getClient(tableName).createEntity(entity)
  }

  getEntity (table: string, partitionKey: string, rowKey: string): Promise<TableEntity<object>> {
    return this.getClient(table).getEntity(partitionKey, rowKey)
  }

  replaceEntity (table: string, entity: TableEntity<object>): Promise<UpdateEntityResponse> {
    return this.getClient(table).updateEntity(entity, 'Replace')
  }

  mergeUpdateEntity (tableName: string, entity: TableEntity<object>): Promise<UpdateEntityResponse> {
    return this.getClient(tableName).updateEntity(entity, 'Merge')
  }
}
