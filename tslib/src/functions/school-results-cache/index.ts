import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as RA from 'ramda-adjunct'
import * as sb from '@azure/service-bus'

import config from '../../config'
import { ResultService } from './services/result.service'
import { type IFunctionTimer } from '../../azure/functions'

const functionName = 'school-results-cache'

/*
 * The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const sbMessageReceiver: AzureFunction = async function sbMessageReceiver (context: Context, timer: IFunctionTimer): Promise<void> {
  if (timer.isPastDue) {
    context.log(`${functionName} timer is past due, exiting...`)
    return
  }
  const start = performance.now()
  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${functionName} ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let receiver: sb.ServiceBusReceiver
  const receiveQueueName = 'school-results-cache'

  const disconnect = async (): Promise<void> => {
    await receiver.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log.verbose(`${functionName}: connecting to service bus...`)
    busClient = new sb.ServiceBusClient(config.ServiceBus.ConnectionString)
    receiver = busClient.createReceiver(receiveQueueName, {
      receiveMode: 'peekLock'
    })
    context.log(`${functionName}: connected to service bus instance ${busClient.fullyQualifiedNamespace}`)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.log.error(`${functionName}: unable to connect to service bus at this time:${errorMessage}`)
    throw error
  }

  for (let batchIndex = 0; batchIndex < config.SchoolResultsCache.BatchesPerExecution; batchIndex++) {
    context.log(`${functionName}: starting batch ${batchIndex + 1} of ${config.SchoolResultsCache.BatchesPerExecution}...`)
    const messageBatch = await receiver.receiveMessages(config.SchoolResultsCache.MessagesPerBatch)
    if (RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: no messages to process`)
      await disconnect()
      finish(start, context)
      return
    }
    context.log(`${functionName}: received batch of ${messageBatch.length} messages`)
    await process(context, messageBatch, receiver)
  }

  await disconnect()
  finish(start, context)
}

async function process (context: Context, messages: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver): Promise<void> {
  if (!RA.isArray(messages)) {
    context.log(`${functionName}: process called with invalid message type`)
    return
  }

  const resultService = new ResultService(context.log)

  for (const msg of messages) {
    // process an individual message at a time
    try {
      await resultService.cacheResultData(msg.body.schoolGuid)
      await completeMessages([msg], receiver, context)
    } catch (error) {
      // sql transaction failed, abandon...
      context.log.warn(`${functionName}: error processing message ${JSON.stringify(msg)}\n Error was: ${error}`)
      console.error(error)
      await abandonMessages([msg], receiver, context)
    }
  }
}

async function completeMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: Context): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      await receiver.completeMessage(msg)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      try {
        await receiver.abandonMessage(msg)
      } catch {
        context.log.error(`${functionName}: unable to abandon message:${errorMessage}`)
        // do nothing.
        // the lock will expire and message reprocessed at a later time
      }
    }
  }
}

async function abandonMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: Context): Promise<void> {
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      await receiver.abandonMessage(msg)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      context.log.error(`${functionName}: abandonMessages(): unable to abandon message: ${errorMessage}`)
    }
  }
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default sbMessageReceiver
