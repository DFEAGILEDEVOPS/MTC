import { app, input, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as V1 from './check-marker.v1'
import type { ReceivedCheckFunctionBindingEntity, MarkCheckMessageV1 } from '../../schemas/models'

const functionName = 'check-marker'
const marker = new V1.CheckMarkerV1()

const outputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'myoutputqueue'
})

const outputTable = output.table({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'checkResult'
})

const inputReceivedCheckTable = input.table({
  filter: "(PartitionKey eq '{schoolUUID}') and (RowKey eq '{checkCode}')",
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'receivedCheck',
  take: 1
})

app.serviceBusQueue('serviceBusQueueTrigger', {
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'myinputqueue',
  handler: serviceBusQueueTrigger,
  extraOutputs: [outputQueue, outputTable],
  extraInputs: [inputReceivedCheckTable]
})

export async function serviceBusQueueTrigger (message: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const markCheckMessage = message as MarkCheckMessageV1
  const version = markCheckMessage.version
  context.info(`${functionName}: version:${version} message received for checkCode ${markCheckMessage.checkCode}`)
  try {
    if (version !== 1) {
      throw new Error(`Message schema version ${version} unsupported`)
    }
    const tableInput = context.extraInputs.get('receivedCheck')
    const receivedCheckInput = tableInput as ReceivedCheckFunctionBindingEntity
    await marker.mark(receivedCheckInput, context)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${functionName}: ERROR: ${errorMessage}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
