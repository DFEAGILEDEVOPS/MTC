import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IQueueMessageReplayRequest } from './message-replay.service'

const functionName = 'queue-replay-service-bus'



function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const queueReplayServiceBus: AzureFunction = async function (context: Context, busMessage: IQueueMessageReplayRequest): Promise<void> {

}

export default queueReplayServiceBus
