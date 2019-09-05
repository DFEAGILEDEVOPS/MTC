'use strict'

import 'dotenv/config'
import * as az from 'azure-storage'
import bluebird from 'bluebird'

export declare class AsyncTableService extends az.TableService {
  replaceEntityAsync (table: string, entity: any): Promise<any>
  queryEntitiesAsync (table: string, tableQuery: az.TableQuery, currentToken?: az.TableService.TableContinuationToken): Promise<any>
  deleteEntityAsync (table: string, entityDescriptor: any): Promise<any>
  insertEntityAsync (table: string, entityDescriptor: unknown, options?: az.TableService.InsertEntityRequestOptions): Promise<any>
}

export declare class StorageError extends Error {
  type: string
}
/* common logger methods to merge with Context.Log etc */
interface CommonLogger {
  error(msg: string): void
  info(msg: string): void
}

const preparedCheckTable = 'preparedCheck'
let tableService: AsyncTableService
let qService: az.QueueService
let blobService: az.BlobService

const azureStorageHelper = {
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
