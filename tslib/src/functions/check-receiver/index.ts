import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CheckReceiver } from './check-receiver'
import { type SubmittedCheckMessageV2 } from '../../schemas/models'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'

const functionName = 'check-receiver'

const queueTrigger: AzureFunction = async function (context: Context, submittedCheck: SubmittedCheckMessageV2): Promise<void> {
  const start = performance.now()
  const version = submittedCheck.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${submittedCheck.checkCode}`)
  const receiver = new CheckReceiver()
  try {
    if (version !== SubmittedCheckVersion.V2) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    await receiver.process(context, submittedCheck)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.log.error(`${functionName}: ERROR: ${errorMessage}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default queueTrigger
