import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CheckValidator, type ICheckValidatorFunctionBindings } from './check-validator'
import { type ValidateCheckMessageV1 } from '../../schemas/models'

const validator = new CheckValidator()
const functionName = 'check-validator'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, validateCheckMessage: ValidateCheckMessageV1): Promise<void> {
  const start = performance.now()
  const version = validateCheckMessage.version
  context.log.info(`${functionName}: version:${version} check validation message received for checkCode ${validateCheckMessage.checkCode}`)
  try {
    if (version !== 1) {
      throw new Error(`Check validation message schema version ${version} unsupported`)
    }
    await validator.validate(context.bindings as ICheckValidatorFunctionBindings, validateCheckMessage, context.log)
  } catch (error: any) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
