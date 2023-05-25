import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type ICheckStartedMessage, CheckStartedService } from './check-started.service'
import * as os from 'os'
const functionName = 'check-started'

const queueTrigger: AzureFunction = async function (context: Context, checkStartedMessage: ICheckStartedMessage): Promise<void> {
  const start = performance.now()
  const version = checkStartedMessage.version
  context.log.info(`${functionName}: version:${version} message received for checkCode ${checkStartedMessage.checkCode}`)
  context.log.info(`${functionName}: IP addresses:${getIp()}`)

  try {
    if (version !== 1) {
      // dead letter the message as we only support v1
      throw new Error(`Message schema version:${version} unsupported`)
    }
    const checkStartedService = new CheckStartedService()
    await checkStartedService.process(checkStartedMessage)
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

function getIp (): string {
  const addresses = new Array<string>()
  try {
    const interfaces = os.networkInterfaces()
    for (const key in interfaces) {
      interfaces[key]?.forEach(iface => {
        addresses.push(iface.address)
      })
    }
  } catch (error) {
    return `unable to obtain IP addresses: ${error.message}`
  }
  return addresses.join(', ')
}

export default queueTrigger
