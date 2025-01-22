import { type Timer, app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { type ICheckNotificationMessage } from '../../schemas/check-notification-message'
import { BatchCheckNotifier } from './batch-check-notifier.service'
const RA = require('ramda-adjunct')

const functionName = 'check-notifier-batch'

app.timer('checkNotifierBatch', {
  schedule: '*/30 * * * * *', // execute every 30 seconds
  handler: batchCheckNotifier
})

/*
 * The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
export async function batchCheckNotifier (timer: Timer, context: InvocationContext): Promise<void> {
  if (timer.isPastDue) {
    context.log(`${functionName}: timer is past due, exiting.`)
    return
  }
  const start = performance.now()

  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${functionName}: ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let receiver: sb.ServiceBusReceiver

  const disconnect = async (): Promise<void> => {
    await receiver.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log(`${functionName}: connecting to service bus...`)
    busClient = new sb.ServiceBusClient(config.ServiceBus.ConnectionString)
    receiver = busClient.createReceiver('check-notification', {
      receiveMode: 'peekLock'
    })
    context.log(`${functionName}: connected to service bus instance ${busClient.fullyQualifiedNamespace}`)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${functionName}: unable to connect to service bus at this time:${errorMessage}`)
    throw error
  }

  for (let batchIndex = 0; batchIndex < config.CheckNotifier.BatchesPerExecution; batchIndex++) {
    context.log(`${functionName}: starting batch ${batchIndex + 1} of ${config.CheckNotifier.BatchesPerExecution}...`)
    const messageBatch = await receiver.receiveMessages(config.CheckNotifier.MessagesPerBatch)
    if (RA.isNilOrEmpty(messageBatch) === true) {
      context.log(`${functionName}: no messages to process`)
      await disconnect()
      finish(start, context)
      return
    }
    context.log(`${functionName}: received batch of ${messageBatch.length} messages`)
    const notifications = messageBatch.map(m => m.body as ICheckNotificationMessage)
    await process(notifications, context, messageBatch, receiver)
  }

  await disconnect()
  finish(start, context)
}

async function process (notifications: ICheckNotificationMessage[], context: InvocationContext, messages: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver): Promise<void> {
  try {
    const batchNotifier = new BatchCheckNotifier(undefined, context)
    await batchNotifier.notify(notifications)
    await completeMessages(messages, receiver, context)
  } catch {
    // sql transaction failed, abandon...
    await abandonMessages(messages, receiver, context)
  }
}

async function completeMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: InvocationContext): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
  context.log(`${functionName}: batch processed successfully, completing all messages in batch`)
  for (const msg of messageBatch) {
    try {
      await receiver.completeMessage(msg)
    } catch (error) {
      try {
        await receiver.abandonMessage(msg)
      } catch {
        let errorMessage = 'unknown error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        context.error(`${functionName}: unable to abandon message:${errorMessage}`)
        // do nothing.
        // the lock will expire and message reprocessed at a later time
      }
    }
  }
}

async function abandonMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: InvocationContext): Promise<void> {
  for (const msg of messageBatch) {
    try {
      await receiver.abandonMessage(msg)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      context.error(`${functionName}: unable to abandon message:${errorMessage}`)
    }
  }
}

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default batchCheckNotifier
