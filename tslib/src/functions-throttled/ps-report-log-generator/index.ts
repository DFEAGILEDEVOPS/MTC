import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'

const functionName = 'ps-report-log-generator'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: any): Promise<void> {
  const start = performance.now()
  context.log.verbose(`${functionName}: Message received.  creating log file from queue messages`)

  try {
    // TODO something
  } catch (error) {
    context.log.error(error)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} finished. run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
