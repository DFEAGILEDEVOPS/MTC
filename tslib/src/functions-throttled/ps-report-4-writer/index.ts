import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IPsychometricReportLine } from '../../functions/ps-report-3-transformer/models'

const functionName = 'ps-report-4-writer'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: IPsychometricReportLine): Promise<void> {
  const start = performance.now()

  // TODO

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed X pupils, run took ${durationInMilliseconds} ms`) // TODO - fixme add in stats
}

export default serviceBusQueueTrigger
