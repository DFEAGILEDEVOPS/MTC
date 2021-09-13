import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as V1 from './check-validator'
import { ValidateCheckMessageV1 } from '../../schemas/models'

const validator = new V1.CheckValidator()
const functionName = 'check-validator'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, validateCheckMessage: ValidateCheckMessageV1): Promise<void> {
  const start = performance.now()
  const version = validateCheckMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${validateCheckMessage.checkCode}`)
  try {
    if (version !== 1) {
      throw new Error(`Message schema version ${version} unsupported`)
    }
    await validator.validate(context.bindings as V1.ICheckValidatorFunctionBindings, validateCheckMessage, context.log)
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
