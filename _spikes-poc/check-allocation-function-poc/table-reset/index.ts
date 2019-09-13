import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import azureStorageHelper from '../lib/azure-storage-helper'
import { TableQuery } from 'azure-storage'
import az = require('azure-storage')
const tableService = azureStorageHelper.getPromisifiedAzureTableService()
import { performance } from 'perf_hooks'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // demonstrate purging of checkAllocation table via delete and recreate
  const start = performance.now()
  const tableName = 'checkAllocation'
  const query = new TableQuery()
  query.top(200)
  let done = false
  let batchNumber = 1
  while (!done) {
    const data = await tableService.queryEntitiesAsync(tableName, query, null)
    const entities: Array<any> = data.result.entries
    if (entities.length === 0) {
      done = true
    }
    const currentPartitionKey = entities[0].PartitionKey._
    context.log(`currentPartitionKey is ${currentPartitionKey}`)
    const batch = new az.TableBatch()
    let batchCount = 0
    for (let index = 0; index < entities.length; index++) {
      const entity = entities[index]
      context.log(`entity.PartitionKey is ${entity.PartitionKey._}`)
      if (entity.PartitionKey._ === currentPartitionKey) {
        batchCount++
        batch.deleteEntity(entity)
      } else {
        break
      }
    }
    context.log(`executing batch ${batchNumber} with ${batchCount} items`)
    await tableService.executeBatchAsync(tableName, batch)
    batchCount = 0
  }
  const end = performance.now()
  const durationMs = end - start
  context.log(`${tableName} cleared in ${millisToMinutesAndSeconds(durationMs)} minutes`)
}

function millisToMinutesAndSeconds (milliSeconds: number) {
  const minutes = Math.floor(milliSeconds / 60000)
  const seconds = +((milliSeconds % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

export default httpTrigger
