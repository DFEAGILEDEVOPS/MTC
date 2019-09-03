import { AzureFunction, Context } from "@azure/functions"
import { SubmittedCheckMessageV3, ValidateCheckMessageV1 } from "../types/message-schemas";
import { performance } from "perf_hooks"
const functionName = 'check-validator'
import v1 from "./v1"

const serviceBusQueueTrigger: AzureFunction = async function(context: Context, validateCheckMessage: ValidateCheckMessageV1): Promise<void> {
  const start = performance.now()
  const version = validateCheckMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${validateCheckMessage.checkCode}`)
  try {
    if (version != "1") {
      throw new Error(`Message schema version ${version} unsupported`)
    }
    await v1.process(context, validateCheckMessage)
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
