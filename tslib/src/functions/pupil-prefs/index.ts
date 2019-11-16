import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'pupil-prefs'

const queueTrigger: AzureFunction = async function (context: Context, pupilPrefsMessage: any): Promise<void> {
  const start = performance.now()
  const version = pupilPrefsMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${pupilPrefsMessage.checkCode}`)
  try {
    if (version !== 3) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    // await V3.process(context, pupilPrefsMessage)
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
