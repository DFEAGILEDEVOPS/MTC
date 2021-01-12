import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PupilResult } from '../../functions-throttled/ps-report-2-pupil-data/models'

const functionName = 'ps-report-transformer'

/**
 * This functions receives a message from a sb queue and outputs a message to a sb queue that will later be written
 * as one line of the psychometric report.
 *
 * Input: service bus queue message containing result details for a single pupil
 * Output: service bus queue message containing a single line of the psychometric report in JSON format
 *
 * @param context
 * @param inputData
 */

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, inputData: PupilResult): Promise<void> {
  const start = performance.now()
  context.log.info(`${functionName}: message received for pupil ${inputData.pupil.slug}`)
  try {
    const outputData: PsychometricReport = { pupilId: 0 }
    context.bindings.outputData = outputData
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
