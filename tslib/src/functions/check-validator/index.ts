import { type InvocationContext, app, input, output } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CheckValidator } from './check-validator'
import type { ReceivedCheckFunctionBindingEntity, ValidateCheckMessageV1 } from '../../schemas/models'

const validator = new CheckValidator()
const functionName = 'check-validator'

const checkNotificationOutputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-notification'
})

const checkMarkingOutputQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-marking'
})

const inputReceivedCheckTable = input.table({
  filter: "(PartitionKey eq '{schoolUUID}') and (RowKey eq '{checkCode}')",
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'receivedCheck',
  take: 1
})

app.serviceBusQueue(functionName, {
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-validation',
  handler: checkValidator,
  extraOutputs: [checkNotificationOutputQueue, checkMarkingOutputQueue],
  extraInputs: [inputReceivedCheckTable]
})

export async function checkValidator (triggerMessage: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const validateCheckMessage = triggerMessage as ValidateCheckMessageV1
  const version = validateCheckMessage.version
  context.info(`${functionName}: version:${version} check validation message received for checkCode ${validateCheckMessage.checkCode}`)
  try {
    if (version !== 1) {
      throw new Error(`Check validation message schema version ${version} unsupported`)
    }
    const tableInput = context.extraInputs.get(inputReceivedCheckTable)
    const receivedCheckInput = tableInput as ReceivedCheckFunctionBindingEntity
    const output = await validator.validate(receivedCheckInput, validateCheckMessage, context)
    context.extraOutputs.set(checkNotificationOutputQueue, output.checkNotificationQueue)
    context.extraOutputs.set(checkMarkingOutputQueue, output.checkMarkingQueue)
  } catch (error: any) {
    context.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
