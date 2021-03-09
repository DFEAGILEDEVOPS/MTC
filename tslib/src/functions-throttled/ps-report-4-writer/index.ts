import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IPsychometricReportLine } from '../../functions/ps-report-3-transformer/models'
import { PsReportWriterService } from './ps-report-writer.service'
import { jsonReviver } from '../../common/json-reviver'

const functionName = 'ps-report-4-writer'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: IPsychometricReportLine): Promise<void> {
  const start = performance.now()
  const messageWithDates = revive(incomingMessage)
  context.log.verbose(`Message received for pupil ${messageWithDates.PupilID} in school ${messageWithDates.SchoolName}`)

  const reportWriter = new PsReportWriterService(context.log)
  try {
    await reportWriter.write(messageWithDates)
  } catch (error) {
    context.log.error(`Failed to write data for pupil ${messageWithDates.PupilID}
    ERROR: ${error.message}`)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed 1 pupil, run took ${durationInMilliseconds} ms`)
}

/**
 * JSON reviver for Date instantiation
 * @param incomingMessage
 */
function revive (message: IPsychometricReportLine): IPsychometricReportLine {
  return JSON.parse(JSON.stringify(message), jsonReviver) as IPsychometricReportLine
}

export default serviceBusQueueTrigger
