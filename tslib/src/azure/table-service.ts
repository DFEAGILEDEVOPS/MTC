import { TableClient, TableEntity } from '@azure/data-tables'
import config from '../config'

export interface ITableService {
  getEntity (tableName: string, partitionKey: string, rowKey: string): Promise<TableEntity<object>>
  replaceEntity (tableName: string, entity: TableEntity<object>): Promise<void>
  createEntity (tableName: string, entity: TableEntity<object>): Promise<void>
  mergeUpdateEntity (tableName: string, entity: TableEntity<object>): Promise<void>
}

export class TableService implements ITableService {
  private getClient (tableName: string): TableClient {
    return TableClient.fromConnectionString(config.AzureStorage.ConnectionString, tableName)
  }

  async createEntity (tableName: string, entity: TableEntity<object>): Promise<void> {
    await this.getClient(tableName).createEntity(entity)
  }

  async getEntity (tableName: string, partitionKey: string, rowKey: string): Promise<TableEntity<object>> {
      return this.getClient(tableName).getEntity(partitionKey, rowKey)
  }

  async replaceEntity (tableName: string, entity: TableEntity<object>): Promise<void> {
    await this.getClient(tableName).updateEntity(entity, 'Replace')
  }

  async mergeUpdateEntity (tableName: string, entity: TableEntity<object>): Promise<void> {
    await this.getClient(tableName).updateEntity(entity, 'Merge')
  }
}
