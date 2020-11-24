import * as sb from '@azure/service-bus'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'

import config from '../../config'
import { ICheckCompletionMessage } from './models'
import { IFunctionTimer } from '../../azure/functions'
import { SyncResultsServiceFactory } from './sync-results.service.factory'
import { ProcessingFailureService } from './processing-failure.service'

const meta = { checksProcessed: 0, checksErrored: 0, errorCheckCodes: [] as string[] }
const functionName = 'sync-results-to-sql'

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
 */
const maxDeliveryAttempts = 10

/*
 * The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const timerTrigger: AzureFunction = async function (context: Context, timer: IFunctionTimer): Promise<void> {
  meta.checksProcessed = 0
  meta.checksErrored = 0
  meta.errorCheckCodes = []
  const start = performance.now()
  if (timer.IsPastDue) {
    context.log(`${functionName}: Timer function is past due, exiting.`)
    return
  }

  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${functionName}: ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let queueClient: sb.QueueClient
  let receiver: sb.Receiver
  let syncResultsServiceFactory: SyncResultsServiceFactory

  const disconnect = async (): Promise<void> => {
    await receiver.close()
    await queueClient.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log(`${functionName}: connecting to service bus...`)
    busClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
    queueClient = busClient.createQueueClient('check-completion')
    receiver = queueClient.createReceiver(sb.ReceiveMode.peekLock)
    syncResultsServiceFactory = new SyncResultsServiceFactory(context.log)
    context.log(`${functionName}: connected to service bus instance ${busClient.name}`)
  } catch (error) {
    context.log.error(`${functionName}: unable to connect to service bus at this time:${error.message}`)
    throw error
  }

  // Queue drain pattern - one message at a time
  let drained = false
  const numberOfMessagesPerBatch = 1
  let receivingErrorCount = 0
  const maxErrors = 100

  while (!drained) {
    let messageBatch
    try {
      messageBatch = await receiver.receiveMessages(numberOfMessagesPerBatch)
    } catch (error) {
      context.log.error(`${functionName}: error when receiving messages: ${error.message}`)
      receivingErrorCount += 1
      if (receivingErrorCount < maxErrors) {
        await sleep(5000)
        continue // re-enter while loop
      } else {
        context.log(`${functionName}: too many errors`)
        await disconnect()
        throw error
      }
    }
    if (RA.isNilOrEmpty(messageBatch)) {
      drained = true
      context.log(`${functionName}: no more messages to process`)
      await disconnect()
      finish(start, context)
    }
    context.log(`${functionName}: received batch of ${messageBatch.length} messages`)
    const completionMessages = messageBatch.map(m => m.body as ICheckCompletionMessage)
    await process(completionMessages, context, messageBatch, syncResultsServiceFactory)
  }
}

async function process (checkCompletionMessages: ICheckCompletionMessage[], context: Context, queueMessages: sb.ServiceBusMessage[], syncResultsServiceFactory: SyncResultsServiceFactory): Promise<void> {
  const syncResultsService = syncResultsServiceFactory.create()
  for (let i = 0; i < checkCompletionMessages.length; i++) {
    const msg = checkCompletionMessages[i]
    const queueMessage = queueMessages[i]
    try {
      await syncResultsService.process(msg)
      meta.checksProcessed += 1
      // Work done, consume the messages from the queue
      await completeMessages([queueMessage], context)
    } catch (error) {
      meta.checksErrored += 1
      if (!meta.errorCheckCodes.includes(msg.markedCheck.checkCode)) {
        meta.errorCheckCodes.push(msg.markedCheck.checkCode)
      }
      // sql transaction failed, abandon...
      await abandonMessages([queueMessage], context)
    }
  }
}

async function completeMessages (messageBatch: sb.ServiceBusMessage[], context: Context): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
  context.log(`${functionName}: processed successfully, completing message`)
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      await msg.complete()
    } catch (error) {
      try {
        await msg.abandon()
      } catch {
        context.log.error(`${functionName}: unable to abandon message:${error.message}`)
        // do nothing.
        // the lock will expire and message reprocessed at a later time
      }
    }
  }
}

async function abandonMessages (messageBatch: sb.ServiceBusMessage[], context: Context): Promise<void> {
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      if (isLastDeliveryAttempt(msg, maxDeliveryAttempts)) {
        await handleLastDeliveryAttempt(context, msg)
      }
      await msg.abandon()
    } catch (error) {
      context.log.error(`${functionName}: unable to abandon message:${error.message}`)
    }
  }
}

function isLastDeliveryAttempt (msg: sb.ServiceBusMessage, maxAttempts: number): boolean {
  // We need to know if this is the last delivery attempt. Note that deliveryCount property will not
  // be updated to the maximum until we call abandon() or complete() to release the lock.
  if (msg.deliveryCount === (maxAttempts - 1)) {
    return true
  }
  return false
}

async function handleLastDeliveryAttempt (context: Context, msg: sb.ServiceBusMessage): Promise<void> {
  const checkCode = R.pathOr('n/a', ['body', 'markedCheck', 'checkCode'], msg)
  context.log.error(`${functionName}: Last delivery attempt for ${checkCode} it has had ${msg.deliveryCount} deliveries already`)
  try {
    const processingFailureService = new ProcessingFailureService(context.log)
    await processingFailureService.processingFailed(checkCode)
    context.log.error(`${functionName}: Processing failed for checkCode ${checkCode}`)
  } catch (error) {
    context.log.error(`${functionName}: ALERT: Failed to set processing failed for check ${checkCode}`)
    throw error
  }
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  const metaStr = JSON.stringify(meta)
  context.log(`${functionName}: ${metaStr}`)
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

async function sleep (ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default timerTrigger
