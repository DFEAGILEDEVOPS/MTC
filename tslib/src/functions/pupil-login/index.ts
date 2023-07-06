import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PupilLoginService, type IPupilLoginMessage, type IPupilLoginFunctionBindings } from './pupil-login.service'

const functionName = 'pupil-login'
const pupilLoginService = new PupilLoginService()

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, pupilLoginMessage: IPupilLoginMessage): Promise<void> {
  const start = performance.now()
  const version = pupilLoginMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${pupilLoginMessage.checkCode}`)

  await pupilLoginService.process(pupilLoginMessage, context.bindings as IPupilLoginFunctionBindings)

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
