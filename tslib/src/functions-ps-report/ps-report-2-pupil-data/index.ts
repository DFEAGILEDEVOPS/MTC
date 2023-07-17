import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PsReportService } from './ps-report.service'
import { type PupilResult } from './models'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'

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
  const logger = new PsReportLogger(context, PsReportSource.PupilGenerator)
  logger.verbose(`called for school ${incomingMessage.name}`)
  const outputBinding: PupilResult[] = []
  context.bindings.psReportPupilMessage = outputBinding
  const psReportService = new PsReportService(outputBinding, logger)
  await psReportService.process(incomingMessage.uuid)
  const end = performance.now()
  const durationInMilliseconds = end - start
  logger.info(`processed ${outputBinding.length} pupils, run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
