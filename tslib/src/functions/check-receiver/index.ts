/* eslint-disable import/first */
// intentionally named incorrectly to test app insights in azure.  will be corrected
const functionName = 'the-check-receiver'
import aiHelper from '../../azure/app-insights'
// load early to enable tracking
aiHelper.startInsightsIfConfigured(functionName)

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CheckReceiver } from './check-receiver'
import { SubmittedCheckMessageV2 } from '../../schemas/models'

const queueTrigger: AzureFunction = async function (context: Context, submittedCheck: SubmittedCheckMessageV2): Promise<void> {
  const start = performance.now()
  const version = submittedCheck.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${submittedCheck.checkCode}`)
  const receiver = new CheckReceiver()
  try {
    if (version !== 2) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    await receiver.process(context, submittedCheck)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default queueTrigger
