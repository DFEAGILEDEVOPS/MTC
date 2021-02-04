import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IPsychometricReportLine } from '../../functions/ps-report-3-transformer/models'
import { PsReportWriterService } from './ps-report-writer.service'

const functionName = 'ps-report-4-writer'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: IPsychometricReportLine): Promise<void> {
  const start = performance.now()
  context.log.verbose(`Message received for pupil ${incomingMessage.PupilID} in school ${incomingMessage.SchoolName}`)
  const reportWriter = new PsReportWriterService(context.log)
  try {
    await reportWriter.write(incomingMessage)
  } catch (error) {
    context.log.error(`Failed to write data for pupil ${incomingMessage.PupilID}
    ERROR: ${error.message}`)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed 1 pupil, run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
