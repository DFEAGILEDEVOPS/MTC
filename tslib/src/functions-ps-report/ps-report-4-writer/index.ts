import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'

const blobTrigger: AzureFunction = async function (context: Context, blob: any): Promise<void> {
  const start = performance.now()
  const funcName = 'ps-report-4-writer'
  context.log(`${funcName}: new blob detected: ${context.bindingData.uri}`)
  context.log(`${funcName}: bindingData: ` + JSON.stringify(context.bindingData))
  context.log(`Blob ${blob}`)
  await bulkUpload(context)
  const end = performance.now()
  const durationInMilliseconds = end - start
  context.log(`${funcName} complete:run took ${durationInMilliseconds} ms`)
}

async function bulkUpload (context: Context): Promise<void> {
  const baseName = context.bindingData.uri.substring(context.bindingData.uri.lastIndexOf('/') + 1)
  context.log(`baseName ${baseName}`)
}

export default blobTrigger
