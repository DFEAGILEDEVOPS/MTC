import { AzureFunction, Context } from '@azure/functions'
import { SubmittedCheckMessageV3, ValidateCheckMessageV1 } from '../typings/message-schemas'
import { performance } from 'perf_hooks'
const functionName = 'check-validator'
import * as V1 from './check-validator.v1'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, validateCheckMessage: ValidateCheckMessageV1): Promise<void> {
  const start = performance.now()
  const version = validateCheckMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${validateCheckMessage.checkCode}`)
  try {
    if (version !== '1') {
      throw new Error(`Message schema version ${version} unsupported`)
    }
    const validator = new V1.CheckValidatorV1()
    await validator.validate(context.bindings.receivedCheckTable, validateCheckMessage, context.log)
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
