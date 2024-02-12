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

/*
 * The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const PsReportStageCsvFile: AzureFunction = async function (context: Context, timer: IFunctionTimer): Promise<void> {
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

  for (let batchIndex = 0; batchIndex < config.PsReport.StagingFile.WriteMessagesPerBatch; batchIndex++) {
    context.log(`${functionName}: starting batch ${batchIndex + 1} of ${config.CheckNotifier.BatchesPerExecution}...`)
    const messageBatch = await receiver.receiveMessages(config.CheckNotifier.MessagesPerBatch)
    if (RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: no messages to process`)
      if (emptyPollTime === undefined) {
        emptyPollTime = performance.now()
        const timeSinceLastMessage = performance.now() - emptyPollTime
        const tenMinutesInMs = 10 * 1000 * 60
        if (timeSinceLastMessage >= tenMinutesInMs) {
          await disconnect()
          return finish(start, context)
        } else {
          await sleep(10000) // wait 10 seconds before polling again
        }
      }
    }
    context.log(`${functionName}: received batch of ${messageBatch.length} messages`)
    emptyPollTime = undefined
    // const notifications = messageBatch.map(m => m.body as ICheckNotificationMessage)
    // await process(notifications, context, messageBatch, receiver)
  } // end for

  await disconnect()
  finish(start, context)
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

// async function process (context: Context, messages: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver): Promise<void> {
//   try {
//     await batchNotifier.notify(notifications)
//     await completeMessages(messages, receiver, context)
//   } catch (error) {
//     // sql transaction failed, abandon...
//     await abandonMessages(messages, receiver, context)
//   }
// }

export default PsReportStageCsvFile
