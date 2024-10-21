import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type IPupilPreferenceUpdate, PupilPrefsService } from './pupil-prefs.service'

const functionName = 'pupil-prefs'

const checkSyncQueueOutput = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-sync'
})

app.storageQueue(functionName, {
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'pupil-prefs',
  handler: pupilPrefs,
  extraOutputs: [checkSyncQueueOutput]
})

export async function pupilPrefs (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const pupilPrefsMessage = triggerInput as IPupilPreferenceUpdate
  const version = pupilPrefsMessage.version
  context.info(`${functionName}: version:${version} message received for checkCode ${pupilPrefsMessage.checkCode}`)
  try {
    if (version !== 2) {
      // dead letter the message as we only support v1
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const prefsService = new PupilPrefsService(undefined, context)
    const output = await prefsService.update(pupilPrefsMessage)
    context.extraOutputs.set(checkSyncQueueOutput, output.checkSyncQueue)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${functionName}: ERROR: ${errorMessage}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
