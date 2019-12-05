import { AzureFunction, Context } from '@azure/functions'
import * as schemas from '../../schemas/models'
import { performance } from 'perf_hooks'
const functionName = 'check-receiver'
import CheckReceiver from './check-receiver'

const queueTrigger: AzureFunction = async function (context: Context, submittedCheck: schemas.SubmittedCheckMessageV3): Promise<void> {
  const start = performance.now()
  const version = submittedCheck.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${submittedCheck.checkCode}`)
  try {
    if (version !== 2) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    await CheckReceiver.process(context, submittedCheck)
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
