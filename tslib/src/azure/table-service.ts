import { TableClient, type TableEntity } from '@azure/data-tables'
import config from '../config'

export interface ITableService {
  getEntity<T extends AzureTableEntity> (tableName: string, partitionKey: string, rowKey: string): Promise<TableEntity<T>>
  replaceEntity (tableName: string, entity: TableEntity<object>): Promise<void>
  createEntity (tableName: string, entity: TableEntity<object>): Promise<void>
  mergeUpdateEntity (tableName: string, entity: TableEntity<object>): Promise<void>
}

export interface AzureTableEntity {
  partitionKey: string
  rowKey: string
}

export class TableService implements ITableService {
  private getClient (tableName: string): TableClient {
    return TableClient.fromConnectionString(config.AzureStorage.ConnectionString, tableName)
  }

  async createEntity (tableName: string, entity: TableEntity<object>): Promise<void> {
    await this.getClient(tableName).createEntity(entity)
  }

  async getEntity<T extends AzureTableEntity> (tableName: string, partitionKey: string, rowKey: string): Promise<T> {
    return this.getClient(tableName).getEntity<T>(partitionKey, rowKey)
  }

  async replaceEntity (tableName: string, entity: TableEntity<object>): Promise<void> {
    await this.getClient(tableName).updateEntity(entity, 'Replace')
  }

  async mergeUpdateEntity (tableName: string, entity: TableEntity<object>): Promise<void> {
    await this.getClient(tableName).updateEntity(entity, 'Merge')
  }
}
