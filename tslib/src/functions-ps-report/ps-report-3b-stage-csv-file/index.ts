import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as sb from '@azure/service-bus'
import config from '../../config'
// import { type ICheckNotificationMessage } from '../../schemas/check-notification-message'
import * as RA from 'ramda-adjunct'
import { type IFunctionTimer } from '../../azure/functions'

const functionName = 'ps-report-3b-stage-csv-file'
const receiveQueueName = 'ps-report-export'
const sleep = async (ms: number): Promise<void> => { return new Promise((resolve) => setTimeout(resolve, ms)) }
let emptyPollTime: undefined | number
const getEpoch = (): number => { const dt = +new Date(); return Math.floor(dt / 1000) }
/*
 * The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const PsReportStageCsvFile: AzureFunction = async function (context: Context, timer: IFunctionTimer): Promise<void> {
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

  let done = false
  let batchIndex = 0
  while (!done) {
    context.log(`${functionName}: starting batch ${batchIndex + 1}`)
    const messageBatch = await receiver.receiveMessages(config.CheckNotifier.MessagesPerBatch)
    if (RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: no messages to process`)
      if (emptyPollTime === undefined) {
        context.log(`${functionName}: Setting flag to mark the time since no messages were found.`)
        emptyPollTime = getEpoch()
      }
      const nowEpoch = getEpoch()
      const timeSinceLastMessage = nowEpoch - emptyPollTime
      const tenMinutesInSeconds = 10 * 60
      context.log(`${functionName}: nowEpoch: ${nowEpoch} emptyPollTime: ${emptyPollTime} timeSinceLastMessage: ${timeSinceLastMessage} target wait time is ${tenMinutesInSeconds}`)
      if (timeSinceLastMessage >= tenMinutesInSeconds) {
        context.log(`${functionName}: exiting, as queue has been empty for 10 minutes.`)
        done = true
        await disconnect()
        return finish(start, context)
      } else {
        context.log(`${functionName}: waiting for messages...`)
        await sleep(10000) // wait 10 seconds before polling again
      }
    } else {
      // reset the timer
      emptyPollTime = undefined
    }
    context.log(`${functionName}: received batch of ${messageBatch.length} messages`)
    // const notifications = messageBatch.map(m => m.body as {ICheckNotificationMessage})
    await process(context, messageBatch, receiver)
    batchIndex += 1
  } // end while

  await disconnect()
  finish(start, context)
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

async function completeMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: Context): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
  context.log(`${functionName}: batch processed successfully, completing all messages in batch`)
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
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
      context.log.error(`${functionName}: unable to abandon message:${errorMessage}`)
    }
  }
}

async function process (context: Context, messages: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver): Promise<void> {
  try {
    // await batchNotifier.notify(notifications)
    await completeMessages(messages, receiver, context)
  } catch (error) {
    // sql transaction failed, abandon...
    await abandonMessages(messages, receiver, context)
  }
}

export default PsReportStageCsvFile
