import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PupilResult } from '../../functions-throttled/ps-report-2-pupil-data/models'
import { ReportLine } from './report-line.class'

const functionName = 'ps-report-transformer'

/**
 * This functions receives a message from a sb queue and outputs a message to a sb queue that will later be written
 * as one line of the psychometric report.
 *
 * Input: service bus queue message containing result details for a single pupil
 * Output: service bus queue message containing a single line of the psychometric report in JSON format
 *
 * @param context
 * @param pupilResult
 */

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, pupilResult: PupilResult): Promise<void> {
  const start = performance.now()
  context.log.info(`${functionName}: message received for pupil ${pupilResult.pupil.slug}`)
  try {
    const { answers, check, checkConfig, checkForm, device, events, pupil, school } = pupilResult
    const reportLine = new ReportLine(answers, check, checkConfig, checkForm, device, events, pupil, school)
    const outputData = reportLine.transform()
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
