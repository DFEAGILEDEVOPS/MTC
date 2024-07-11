import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PsReportService } from './ps-report.service'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'
import type { PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'
import config from '../../config'
import type { IPsychometricReportLine } from './transformer-models'

const psReportExportOutputQueue = output.serviceBusQueue({
  queueName: 'ps-report-export',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING'
})

app.serviceBusQueue('ps-report-2-pupil-data', {
  queueName: 'ps-report-schools',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  handler: serviceBusQueueTrigger,
  extraOutputs: [psReportExportOutputQueue]
})

export interface IOutputBinding {
  psReportExportOutput: IPsychometricReportLine[]
}

/**
 * Incoming message is just the name and UUID of the school to process
 * The name is used for logging
 * The UUID is used to fetch all pupils for the school
 */

export async function serviceBusQueueTrigger (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const incomingMessage = triggerInput as PsReportSchoolFanOutMessage
  const logger = new PsReportLogger(context, PsReportSource.PupilGenerator)
  if (config.Logging.DebugVerbosity > 1) {
    logger.trace(`called for school ${incomingMessage.name}`)
  }

  const psReportService = new PsReportService(logger)
  const output = await psReportService.process(incomingMessage)
  context.extraOutputs.set(psReportExportOutputQueue, output.psReportExportOutput)
  const end = performance.now()
  const durationInMilliseconds = end - start
  if (config.Logging.DebugVerbosity > 1) {
    logger.info(`processed ${output.psReportExportOutput.length} pupils, run took ${durationInMilliseconds} ms`)
  }
}
