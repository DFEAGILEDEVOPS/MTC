import { AzureFunction, Context } from "@azure/functions"
import * as schemas from "./types/schemas"
import { performance } from "perf_hooks"
const functionName = "check-receiver"
import v3 from "./v3"

const queueTrigger: AzureFunction = async function (context: Context, completedCheck: schemas.ICompleteCheckMessage): Promise<void> {
  const start = performance.now()
  const version = parseInt(completedCheck.version, 10)
  context.log.info(`${functionName}: version:${version} message received for checkCode ${completedCheck.checkCode}`)
  try {
    if (version !== 3) {
      // dead letter the message as we no longer support below v3
      throw new Error(`Message schema version:${version} unsupported`)
    }
    await v3.process(context, completedCheck)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
};

export default queueTrigger;
