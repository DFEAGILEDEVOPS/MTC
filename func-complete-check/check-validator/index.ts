import { AzureFunction, Context } from "@azure/functions"
import { ICompleteCheckMessageV3 } from "../types/message-schemas";
const { performance } = require('perf_hooks')
const functionName = 'check-validator'
const v1 = require('./v1')

const serviceBusQueueTrigger: AzureFunction = async function(context: Context, checkToValidate: ICompleteCheckMessageV3): Promise<void> {
  const start = performance.now()
  const version = parseInt(checkToValidate.version, 10)
  context.log.info(`${functionName}: version:${version} message received for checkCode ${checkToValidate.checkCode}`)
  try {
    await v1.process(context, checkToValidate)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)

};

export default serviceBusQueueTrigger;
