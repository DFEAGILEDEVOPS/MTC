import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as sb from '@azure/service-bus'
import config from '../../config'
// import { ICheckNotificationMessage } from '../check-notifier/check-notification-message'
// import { BatchCheckNotifier } from './batch-check-notifier.service'
import { ISchoolResultsCacheMessage } from '../school-results-cache-determiner/school-results-cache-determiner.service'
import * as RA from 'ramda-adjunct'
const functionName = 'school-results-cache'

/*
 * The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const sbMessageReceiver: AzureFunction = async function sbMessageReceiver (context: Context, timer: any): Promise<void> {

  if (timer.IsPastDue) {
    context.log(`${functionName} timer is past due, exiting...`)
    return
  }
  const start = performance.now()
  if (!config.ServiceBus.ConnectionString) {
    throw new Error(`${functionName} ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let queueClient: sb.QueueClient
  let receiver: sb.Receiver
  const receiveQueueName = 'school-results-cache'

  const disconnect = async () => {
    await receiver.close()
    await queueClient.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log.verbose(`${functionName}: connecting to service bus...`)
    busClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
    queueClient = busClient.createQueueClient(receiveQueueName)
    receiver = queueClient.createReceiver(sb.ReceiveMode.peekLock)
    context.log(`${functionName}: connected to service bus instance ${busClient.name}`)
  } catch (error) {
    context.log.error(`${functionName}: unable to connect to service bus at this time:${error.message}`)
    throw error
  }

  for (let batchIndex = 0; batchIndex < config.SchoolResultsCache.BatchesPerExecution; batchIndex++) {
    context.log(`${functionName}: starting batch ${batchIndex + 1} of ${config.SchoolResultsCache.BatchesPerExecution}...`)
    const messageBatch = await receiver.receiveMessages(config.SchoolResultsCache.BatchesPerExecution)
    if (RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: no messages to process`)
      await disconnect()
      finish(start, context)
      return
    }
    context.log(`${functionName}: received batch of ${messageBatch.length} messages`)
    const notifications = messageBatch.map(m => m.body as ISchoolResultsCacheMessage)
    await process(notifications, context, messageBatch)
  }

  await disconnect()
  finish(start, context)
}

async function process (notifications: ISchoolResultsCacheMessage[], context: Context, messages: sb.ServiceBusMessage[]): Promise<void> {
  if (!RA.isArray(messages)) {
    context.log(`${functionName}: process called with invalid message type`)
    return
  }

  for (const msg of messages) {
    // process an individual message at a time
    try {
      console.log('Message processed ' + msg.messageId)
      await completeMessages([msg], context)
    } catch (error) {
      // sql transaction failed, abandon...
      context.log.warn(`${functionName}: error processing message ${msg}\n Error was: ${error}`)
      await abandonMessages([msg], context)
    }
  }
  // try {
  //   // TODO: add work here
  //
  //   console.log('Message completed', messages)
  //
  //   await completeMessages(messages, context)
  // } catch (error) {
  //   // sql transaction failed, abandon...
  //   await abandonMessages(messages, context)
  // }
}

async function completeMessages (messageBatch: sb.ServiceBusMessage[], context: Context): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
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
      await msg.abandon()
    } catch (error) {
      context.log.error(`${functionName}: abandonMessages(): unable to abandon message: ${error.message}`)
    }
  }
}

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default sbMessageReceiver
