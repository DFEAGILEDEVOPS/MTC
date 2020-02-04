import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'check-notify'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { ICheckNotificationMessage } from '../check-notifier/check-notification-message'
import { BatchCheckNotifier } from './batch-check-notifier.service'
import * as RA from 'ramda-adjunct'

/*
* This is a poc with certain assumptions...
* The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const batchCheckNotifier: AzureFunction = async function (context: Context, timer: any): Promise<void> {

  if (timer.IsPastDue) {
    context.log('timer is past due, exiting...')
    return
  }
  const start = performance.now()

  if (!config.ServiceBus.ConnectionString) {
    throw new Error('ServiceBusConnection env var is missing')
  }

  let busClient: sb.ServiceBusClient
  let queueClient: sb.QueueClient
  let receiver: sb.Receiver

  const disconnect = async () => {
    await receiver.close()
    await queueClient.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log('connecting to service bus...')
    busClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
    queueClient = busClient.createQueueClient('check-notification')
    receiver = queueClient.createReceiver(sb.ReceiveMode.peekLock)
    context.log(`connected to service bus instance ${busClient.name}`)
  } catch (error) {
    context.log.error(`unable to connect to service bus at this time:${error.message}`)
    throw error
  }

  for (let batchIndex = 0; batchIndex < config.CheckNotifier.BatchesPerExecution; batchIndex++) {
    context.log(`starting batch ${batchIndex + 1} of ${config.CheckNotifier.BatchesPerExecution}...`)
    const messageBatch = await receiver.receiveMessages(config.CheckNotifier.MessagesPerBatch)
    if (RA.isNilOrEmpty(messageBatch)) {
      context.log('no messages to process')
      await disconnect()
      finish(start, context)
      return
    }
    context.log(`received batch of ${messageBatch.length} messages`)
    const notifications = messageBatch.map(m => m.body as ICheckNotificationMessage)
    await process(notifications, context, messageBatch)
  }

  await disconnect()
  finish(start, context)
}

async function process (notifications: ICheckNotificationMessage[], context: Context, messages: sb.ServiceBusMessage[]): Promise<void> {
  try {
    const batchNotifier = new BatchCheckNotifier()
    await batchNotifier.notify(notifications)
    await completeMessages(messages, context)
  } catch (error) {
    // sql transaction failed, abandon...
    await abandonMessages(messages, context)
  }
}

async function completeMessages (messageBatch: sb.ServiceBusMessage[], context: Context): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
  context.log('batch processed successfully, completing all messages in batch')
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      await msg.complete()
    } catch (error) {
      try {
        await msg.abandon()
      } catch {
        context.log.error(`unable to abandon message:${error.message}`)
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
      await msg.abandon()
    } catch (error) {
      context.log.error(`unable to abandon message:${error.message}`)
    }
  }
}

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
  context.done()
}

export default batchCheckNotifier
