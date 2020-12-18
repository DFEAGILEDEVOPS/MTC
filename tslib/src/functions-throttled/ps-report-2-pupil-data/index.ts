import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PsReportService } from './ps-report.service'
import { PupilResult } from './models'

const functionName = 'ps-report-2-pupil-data'

/**
 * Incoming message is just the name and UUID of the school to process
 * The name is used for logging
 * The UUID is used to fetch all pupils for the school
 */
interface IncomingMessage {
  name: string
  uuid: string
}

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: IncomingMessage): Promise<void> {
  const start = performance.now()
  context.log.verbose(`${functionName}: called for school ${incomingMessage.name}`)
  const outputBinding: PupilResult[] = []
  context.bindings.psReportPupilMessage = outputBinding
  const psReportService = new PsReportService(outputBinding, context.log)
  await psReportService.process(incomingMessage.uuid)
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed ${outputBinding.length} pupils, run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
