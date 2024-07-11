import { app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'

import config from '../../config'
import { type ICheckCompletionMessage } from './models'
import { SyncResultsServiceFactory } from './sync-results.service.factory'

const functionName = 'sync-results-to-sql'

app.serviceBusQueue(functionName, {
  connection: 'AZURE_SERVICEBUS_CONNECTION_STRING',
  queueName: 'check-completion',
  handler: syncResultsToSql
})

/**
 * We are unable to determine the maximum number of delivery attempts for the azure service-bus queue
 * dynamically.  This will be a possibility in @azure/service-bus version 7 which has a new API
 * compared to v1.1.10.
 * https://docs.microsoft.com/en-us/javascript/api/overview/azure/service-bus-readme-pre?view=azure-node-latest
 *
 * This needs to be kept in sync with the `check-completion` 'Max Delivery Count' setting.
 *
 * TODO: upgrade to v7 client and dynamically fetch the Max Delivery Count setting from the service-bus queue
 * https://github.com/Azure/azure-sdk-for-js/blob/%40azure/service-bus_7.0.0-preview.8/sdk/servicebus/service-bus/samples/typescript/src/advanced/administrationClient.ts
 *
 * This is used so we can detect when the message is on the very last delivery, and take action to update the pupil and check to
 * show that processing the check result failed.
 *
 * Update 10th June 2021
 * ---------------------
 * The binding is now changing from a timer to the check-completion queue, so the above usage of a library is now a moot point.
 *
 * There are various properties available on the context.bindingData object, such as context.bindingData.deliveryCount
 * which are documented here - https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-service-bus-trigger?tabs=javascript#message-metadata
 *
 * unfortunately no max delivery attempts value appears to be available
 */
const maxDeliveryAttempts = config.ServiceBus.CheckCompletionQueueMaxDeliveryCount

/**
 *
 * The function is running as a singleton, and the receiver is therefore exclusive
 * we do not expect another receive operation to be in progress.
 * if the message is abandoned 10 times (the current 'max delivery count') it will be
 * put on the dead letter queue automatically.
 */
export async function syncResultsToSql (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const syncResultsServiceFactory = new SyncResultsServiceFactory(context)
  const checkCompletionMessage = triggerInput as ICheckCompletionMessage
  await processV2(checkCompletionMessage, context, syncResultsServiceFactory)
  finish(start, context)
}

async function processV2 (message: ICheckCompletionMessage, context: InvocationContext, syncResultsServiceFactory: SyncResultsServiceFactory): Promise<void> {
  const syncResultsService = syncResultsServiceFactory.create()
  try {
    await syncResultsService.process(message)
    context.log(`[${functionName}] finished processing check ${message.markedCheck.checkCode}`)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${functionName}: Error syncing results for check ${message.markedCheck.checkCode}. Error:${errorMessage}`)
    if (isLastDeliveryAttempt(context)) {
      handleLastDeliveryAttempt(context, message)
    }
  }
}

function isLastDeliveryAttempt (context: InvocationContext): boolean {
  // We need to know if this is the last delivery attempt. Note that deliveryCount property will not
  // be updated to the maximum until we call abandon() or complete() to release the lock.
  if (context.triggerMetadata?.deliveryCount === (maxDeliveryAttempts - 1)) {
    return true
  }
  return false
}

function handleLastDeliveryAttempt (context: InvocationContext, message: ICheckCompletionMessage): void {
  context.error(`${functionName}: Last delivery attempt for ${message.markedCheck.checkCode} it has had ${context.triggerMetadata?.deliveryCount} deliveries already`)
}

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
