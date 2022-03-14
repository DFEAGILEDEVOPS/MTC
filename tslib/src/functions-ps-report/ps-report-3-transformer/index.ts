import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { ReportLine } from './report-line.class'
import { jsonReviver } from '../../common/json-reviver'
import { PupilResult } from '../../functions-ps-report/ps-report-2-pupil-data/models'
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

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, inputData: PupilResult): Promise<void> {
  const start = performance.now()
  context.log.info(`${functionName}: message received for pupil ${inputData.pupil.slug}`)
  try {
    /**
     * The inputData type is not absolutely correctly typed.  The Moment datetime's are still strings as the JSON parsing happens
     * outside of this context, so we can't pass in a custom reviver function.
     *
     * We could access context.bindings.inputData (and parse that rather than the function parameter) but this leads to some brittleness
     * as the parameter name may change.
     *
     * The upshot is that the below `revive` function does what we need, and we can use the correctly typed pupilResult const that is
     * returned.
     */
    const pupilResult: PupilResult = revive(inputData)
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

/**
 * JSON reviver for Date instantiation
 * @param pupilResult
 */
function revive (pupilResult: PupilResult): PupilResult {
  return JSON.parse(JSON.stringify(pupilResult), jsonReviver) as PupilResult
}

export default serviceBusQueueTrigger
