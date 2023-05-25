import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as V1 from './check-marker.v1'
import { type ICheckMarkerFunctionBindings } from './models'
import { type MarkCheckMessageV1 } from '../../schemas/models'

const functionName = 'check-marker'
const marker = new V1.CheckMarkerV1()

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, markCheckMessage: MarkCheckMessageV1): Promise<void> {
  const start = performance.now()
  const version = markCheckMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${markCheckMessage.checkCode}`)
  try {
    if (version !== 1) {
      throw new Error(`Message schema version ${version} unsupported`)
    }
    await marker.mark(context.bindings as ICheckMarkerFunctionBindings, context.log)
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
