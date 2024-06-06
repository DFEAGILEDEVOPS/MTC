import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PsReportService } from './ps-report.service'
import { type PupilResult } from './models'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'
import type { PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'
import config from '../../config'

/**
 * Incoming message is just the name and UUID of the school to process
 * The name is used for logging
 * The UUID is used to fetch all pupils for the school
 */

export interface IOutputBinding {
  psReportPupilMessage: PupilResult[]
}

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: PsReportSchoolFanOutMessage): Promise<void> {
  const start = performance.now()
  const logger = new PsReportLogger(context, PsReportSource.PupilGenerator)
  if (config.Logging.DebugVerbosity > 1) {
    logger.verbose(`called for school ${incomingMessage.name}`)
  }
  const outputBinding: IOutputBinding = { psReportPupilMessage: [] }
  context.bindings = outputBinding
  const psReportService = new PsReportService(outputBinding, logger)
  await psReportService.process(incomingMessage)
  const end = performance.now()
  const durationInMilliseconds = end - start
  if (config.Logging.DebugVerbosity > 1) {
    logger.info(`processed ${outputBinding.psReportPupilMessage.length} pupils, run took ${durationInMilliseconds} ms`)
  }
}

export default serviceBusQueueTrigger
