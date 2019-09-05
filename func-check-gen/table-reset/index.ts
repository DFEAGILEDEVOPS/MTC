import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import azureStorageHelper from '../lib/azure-storage-helper'
import { TableQuery } from 'azure-storage'
const tableService = azureStorageHelper.getPromisifiedAzureTableService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // demonstrate purging of checkAllocation table via delete and recreate
  const tableName = 'checkAllocation'
  const query = new TableQuery()
  query.top(10000)
  const batch = await tableService.queryEntitiesAsync(tableName, query)
  // add to delete batch
  // execute batch
  // repeat until query returns nothing
}

export default httpTrigger
