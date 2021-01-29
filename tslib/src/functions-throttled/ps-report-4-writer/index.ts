import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'

// the interface is not yet available
// import { IPsychometricReportLine } from '.././../functions/'

const functionName = 'ps-report-4-writer'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: any): Promise<void> {
  const start = performance.now()

  // TODO

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed X pupils, run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
