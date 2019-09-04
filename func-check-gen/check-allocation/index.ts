import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { TableUtilities, TableBatch } from 'azure-storage'
import azureStorageHelper from '../lib/azure-storage-helper'
const tableService = azureStorageHelper.getPromisifiedAzureTableService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const schoolCount = 10000 // 18000
  const pupilCount = 45
  const pupilPin = 1234
  const schoolPin = 123456
  let batch
  const entGen = TableUtilities.entityGenerator
  context.log(`entity generator is ${entGen}`)
  for (let schoolIdx = 1001; schoolIdx <= schoolCount; schoolIdx++) {
    context.log(`building batch ${schoolIdx}`)
    batch = new TableBatch()
    for (let pupilIdx = 1; pupilIdx <= pupilCount; pupilIdx++) {
      batch.insertEntity({
        PartitionKey: entGen.String(schoolIdx.toString()),
        RowKey: entGen.String(pupilIdx.toString()),
        activated: entGen.Boolean(false),
        allocatedCheckForm: entGen.String('lsdfjksdkfjskldfjsdkfjsdlfjsldfjsdkfjsdfjsldfjsdklfjsdklfjsdkfj'),
        allocatedPupilPin: entGen.String(pupilPin.toString()),
        allocatedSchoolPin: entGen.String(schoolPin.toString()),
        createdAt: entGen.DateTime(new Date().toISOString())
      }, {})
    }
    context.log(`executing batch ${schoolIdx}`)
    await tableService.executeBatchAsync('checkAllocation', batch)
  }
}

export default httpTrigger
