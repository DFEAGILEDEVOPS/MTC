import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PupilPrefsService } from './pupil-prefs.service'
import { type IPupilPrefsFunctionBindings } from './IPupilPrefsFunctionBindings'

const functionName = 'pupil-prefs'

const queueTrigger: AzureFunction = async function (context: Context, pupilPrefsMessage: any): Promise<void> {
  const start = performance.now()
  const version = pupilPrefsMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${pupilPrefsMessage.checkCode}`)
  try {
    if (version !== 1) {
      // dead letter the message as we only support v1
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const prefsService = new PupilPrefsService(undefined, context.log)
    await prefsService.update(pupilPrefsMessage, context.bindings as IPupilPrefsFunctionBindings)
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
