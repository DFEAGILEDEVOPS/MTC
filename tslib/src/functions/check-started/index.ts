import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { ICheckStartedMessage, CheckStartedService, ICheckStartedFunctionBindings } from './check-started.service'
const functionName = 'check-started'

const queueTrigger: AzureFunction = async function (context: Context, checkStartedMessage: ICheckStartedMessage): Promise<void> {
  const start = performance.now()
  const version = checkStartedMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${checkStartedMessage.checkCode}`)
  try {
    if (version !== 1) {
      // dead letter the message as we only support v1
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const checkStartedService = new CheckStartedService()
    await checkStartedService.process(checkStartedMessage, context.bindings as ICheckStartedFunctionBindings)
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
