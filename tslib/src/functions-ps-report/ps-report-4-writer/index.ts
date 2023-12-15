import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'

const blobTrigger: AzureFunction = async function (context: Context, blob: any): Promise<void> {
  const start = performance.now()
  const funcName = 'ps-report-4-writer'
  context.log(`${funcName}: new blob detected: ${context.bindingData.uri}`)
  const end = performance.now()
  const durationInMilliseconds = end - start
  context.log(`${funcName} complete:run took ${durationInMilliseconds} ms`)
}

export default blobTrigger
