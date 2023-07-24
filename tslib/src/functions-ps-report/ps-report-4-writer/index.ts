import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type IPsychometricReportLine } from '../ps-report-3-transformer/models'
import { PsReportWriterService } from './ps-report-writer.service'
import { jsonReviver } from '../../common/json-reviver'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: IPsychometricReportLine): Promise<void> {
  const start = performance.now()
  const messageWithDates = revive(incomingMessage)
  const logger = new PsReportLogger(context, PsReportSource.Writer)

  logger.verbose(`Message received for pupil ${messageWithDates.PupilUPN} in school ${messageWithDates.SchoolName}`)

  const reportWriter = new PsReportWriterService(logger)
  try {
    await reportWriter.write(messageWithDates)
  } catch (error: any) {
    logger.error(`Failed to write data for pupil ${messageWithDates.PupilUPN}
    ERROR: ${error.message}`)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  logger.info(`processed 1 pupil, run took ${durationInMilliseconds} ms`)
}

/**
 * JSON reviver for Date instantiation
 * @param incomingMessage
 */
function revive (message: IPsychometricReportLine): IPsychometricReportLine {
  return JSON.parse(JSON.stringify(message), jsonReviver) as IPsychometricReportLine
}

export default serviceBusQueueTrigger
