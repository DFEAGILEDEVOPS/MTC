'use strict'

import * as path from 'path'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
const globalDotEnvFile = path.join(__dirname, '..', '..', '..', '..', '.env')
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
const QueryComparisons = az.TableUtilities.QueryComparisons
const TableQuery = az.TableQuery
import bluebird from 'bluebird'
import { Logger } from '@azure/functions'

export declare class AsyncTableService extends az.TableService {
  replaceEntityAsync (table: string, entity: any): Promise<any>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken: az.TableService.TableContinuationToken | null): Promise<any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
  executeBatchAsync (table: string, batch: az.TableBatch): Promise<any>
  deleteTableIfExistsAsync (table: string): Promise<az.ErrorOrResponse>
}

export declare class StorageError extends Error {
  type: string
}

const preparedCheckTable = 'preparedCheck'
let tableService: AsyncTableService
let qService: az.QueueService
let blobService: az.BlobService

const azureStorageHelper = {
  getFromPreparedCheckTableStorage: async function getFromPreparedCheckTableStorage (azureTableService: az.TableService, checkCode: string, logger: Logger) {
    const query = new az.TableQuery()
      .top(1)
      .where(TableQuery.guidFilter('checkCode', QueryComparisons.EQUAL, checkCode))

    let check
    try {
      const data = await tableService.queryEntitiesAsync(preparedCheckTable, query, null)
      check = data.response.body.value[0]
    } catch (error) {
      const msg = `getFromPreparedCheckTableStorage(): error during retrieve for table storage check for checkCode [${checkCode}]`
      logger.error(msg)
      logger.error(error.message)
      throw new Error(msg)
    }

    if (!check) {
      const msg = `getFromPreparedCheckTableStorage(): check does not exist: [${checkCode}]`
      logger.info(msg)
      const error = new StorageError(msg)
      error.type = 'NOT_FOUND'
      throw error
    }
    return check
  },

  deleteFromPreparedCheckTableStorage: async function deleteFromPreparedCheckTableStorage (tableService: AsyncTableService, checkCode: string, logger: Logger) {
    const check = await azureStorageHelper.getFromPreparedCheckTableStorage(tableService, checkCode, logger)
    const entity = {
      PartitionKey: check.PartitionKey,
      RowKey: check.RowKey
    }

    // Delete the prepared check so the pupil cannot login again
    try {
      const res = await tableService.deleteEntityAsync(preparedCheckTable, entity)
      if (!(res && res.result && res.result.isSuccessful === true)) {
        throw new Error('deleteFromPreparedCheckTableStorage(): bad result from deleteEntity')
      }
    } catch (error) {
      const msg = `deleteFromPreparedCheckTableStorage(): failed to delete prepared check for checkCode: [${checkCode}]`
      logger.error(msg)
      logger.error(error.message)
      throw error
    }
  },

  /**
   * Promisify and cache the azureTableService library as it still lacks Promise support
   */
  getPromisifiedAzureTableService: function getPromisifiedAzureTableService (): AsyncTableService {
    if (tableService) {
      return tableService
    }
    tableService = az.createTableService() as AsyncTableService
    bluebird.promisifyAll(tableService, {
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

    return tableService
  },

  /**
   * Promisify the azureQueueService
   * @return {*}
   */
  getPromisifiedAzureQueueService: function getPromisifiedAzureQueueService () {
    if (qService) {
      return qService
    }
    qService = az.createQueueService()
    bluebird.promisifyAll(qService, {
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

    return qService
  },

  /**
   * Promisify the azureBlobService
   * @return {*}
   */
  getPromisifiedAzureBlobService: function getPromisifiedAzureBlobService () {
    if (blobService) {
      return blobService
    }
    blobService = az.createBlobService()
    bluebird.promisifyAll(blobService, {
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

    return blobService
  }
}

export default azureStorageHelper
